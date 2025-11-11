// src/data/newLaunch.ts
// Robust fetcher for New_Launch_Properties. Supports Apps Script JSON exec or direct CSV export.
// Set either:
//  - VITE_NEWLAUNCH_EXEC = "https://script.google.com/macros/s/XXXXX/exec"
//  - or VITE_NEWLAUNCH_SHEET_CSV = "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=..."
//
// Returns Project[] with normalized fields used by PropertyDetailsPage.

export type Project = {
  project_id?: string;
  slug?: string;
  project_name?: string;
  developer_name?: string;
  segment?: string;
  status?: string;
  new_launch?: string | boolean;
  for_sale?: string | boolean;
  locality?: string;
  city?: string;
  hero_image_url?: string;
  gallery_image_urls?: string | string[];
  price_min_inr?: string | number;
  price_max_inr?: string | number;
  unit_types?: string;
  brochure_url?: string;
  [k: string]: any;
};

const EXEC = (import.meta.env.VITE_NEWLAUNCH_EXEC || "").toString().trim();
const CSV_URL = (import.meta.env.VITE_NEWLAUNCH_SHEET_CSV || "").toString().trim();
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 2);

let cache: { at: number; data: Project[] } | null = null;

/** simple CSV parser that handles quoted cells and commas inside quotes */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let curRow: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      curRow.push(cur);
      cur = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      curRow.push(cur);
      rows.push(curRow);
      curRow = [];
      cur = "";
      if (ch === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cur += ch;
  }
  // final
  if (inQuotes) {
    // malformed CSV — still push what we have
  }
  if (cur.length || curRow.length) {
    curRow.push(cur);
    rows.push(curRow);
  }
  return rows;
}

function normalizeHeaders(hdrs: string[]) {
  return hdrs.map(h => (h || "").toString().trim().toLowerCase());
}

function rowToObj(headers: string[], cols: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    obj[key] = (cols[i] ?? "").toString().trim();
  }
  return obj;
}

function toBool(v: any) {
  if (v === true || v === false) return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(s);
}

function firstOf(obj: Record<string, any>, variants: string[]) {
  for (const v of variants) {
    const k = v.toLowerCase();
    if (obj[k] !== undefined && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function normalizeProject(raw: Record<string, any>): Project {
  // allow raw keys to be in any case — convert to lowercase-keyed map for easy lookup
  const map: Record<string, any> = {};
  Object.keys(raw || {}).forEach(k => { map[k.toLowerCase()] = raw[k]; });

  const project_id = firstOf(map, ["project_id","project id","id"])?.toString();
  const project_name = firstOf(map, ["project_name","project name","name","title"])?.toString();
  const slug = firstOf(map, ["slug"])?.toString() || (project_name ? project_name.toLowerCase().trim().replace(/[^\w]+/g,"-") : undefined);

  // gallery may be a folder string or comma-separated list
  const gallery_raw = firstOf(map, ["gallery_image_urls","gallery","gallery_image_urls","gallery images","gallery_image","image_urls","images"]) || "";
  const hero_image = firstOf(map, ["hero_image_url","hero_image","hero","image"]) || "";

  let gallery: string[] | string = "";
  if (typeof gallery_raw === "string" && gallery_raw) {
    // if looks like JSON array, try parse
    if (gallery_raw.trim().startsWith("[") && gallery_raw.trim().endsWith("]")) {
      try { gallery = JSON.parse(gallery_raw); } catch {}
    } else if (gallery_raw.indexOf(",") !== -1 || gallery_raw.indexOf("|") !== -1) {
      gallery = gallery_raw.split(/[|,]+/).map((s:string)=>s.trim()).filter(Boolean);
    } else {
      gallery = gallery_raw;
    }
  } else if (Array.isArray(gallery_raw)) {
    gallery = gallery_raw;
  }

  const price_min = firstOf(map, ["price_min_inr","price min inr","price_min","price min","price_min_inr"]) || firstOf(map, ["price_min","pricefrom"]);
  const price_max = firstOf(map, ["price_max_inr","price max inr","price_max","priceto","price_max_inr"]);
  const status = firstOf(map, ["status","project_status"])?.toString();
  const new_launch = firstOf(map, ["new_launch","new launch","newlaunch"]);
  const for_sale = firstOf(map, ["for_sale","for sale","forsale"]);
  const unit_types = firstOf(map, ["unit_types","units","configuration","configurations"]);
  const developer_name = firstOf(map, ["developer_name","developer","builder"])?.toString();
  const locality = firstOf(map, ["locality","micro_location","neighborhood"])?.toString();
  const city = firstOf(map, ["city","town"]);
  const brochure = firstOf(map, ["brochure_url","brochure","brochure link","brochure_url"]) || undefined;

  return {
    project_id,
    slug,
    project_name,
    developer_name,
    segment: firstOf(map, ["segment","type"]),
    status,
    new_launch,
    for_sale,
    locality,
    city,
    hero_image_url: hero_image,
    gallery_image_urls: gallery,
    price_min_inr: price_min,
    price_max_inr: price_max,
    unit_types: unit_types,
    brochure_url: brochure,
    _raw: raw
  };
}

/** main fetcher */
export async function fetchNewLaunch(): Promise<Project[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data;

  try {
    let rawArray: any[] = [];

    // 1) If Apps Script exec URL configured, prefer JSON
    if (EXEC && /^https?:\/\//i.test(EXEC)) {
      try {
        const res = await fetch(`${EXEC}?sheet=New_Launch_Properties`, { cache: "no-store" });
        const txt = await res.text();
        try {
          const json = JSON.parse(txt);
          // handle {result:"ok", data:[...]} or plain array
          if (Array.isArray(json)) rawArray = json;
          else if (json && Array.isArray(json.data)) rawArray = json.data;
          else {
            // fallback: if it's object but not array, try to use values property
            rawArray = [];
          }
        } catch (err) {
          // not JSON — will fallback to CSV below
          rawArray = [];
        }
      } catch (err) {
        console.warn("fetchNewLaunch: apps script fetch failed, falling back to CSV", err);
        rawArray = [];
      }
    }

    // 2) If no JSON from exec, try CSV URL
    if ((!rawArray || !rawArray.length) && CSV_URL) {
      const res = await fetch(CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV fetch failed ${res.status}`);
      const txt = await res.text();
      const rows = parseCsv(txt).filter(r => r.length > 0);
      if (!rows.length) rawArray = [];
      else {
        const headers = normalizeHeaders(rows[0]);
        const dataRows = rows.slice(1);
        rawArray = dataRows.map(cols => rowToObj(headers, cols));
      }
    }

    // Map rawArray to Project[] using normalizer
    const mapped = (rawArray || []).map(r => normalizeProject(r || {} as Record<string, any>));

    // Filter: keep under-construction / new launch rows by default
    const filtered = mapped.filter(p => {
      const status = (p.status || "").toString().toLowerCase();
      const isUnder = status.includes("under") || status.includes("launch") || status.includes("uc");
      const flaggedNew = toBool(p.new_launch);
      return isUnder || flaggedNew;
    });

    cache = { at: Date.now(), data: filtered };
    return filtered;
  } catch (err) {
    console.error("fetchNewLaunch failed:", err);
    cache = { at: Date.now(), data: [] };
    return [];
  }
}
