// src/data/sheet.ts
// Final copy-paste version — robust CSV / AppsScript exec sheet loader and normalizer.

export function toBool(v: any): boolean {
  if (v === true || v === false) return v as boolean;
  if (typeof v === "number") return v !== 0;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return ["true", "yes", "y", "1"].includes(s);
}

export const sluggify = (s?: string | null) =>
  (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ----------------- types -----------------------------------------------------
type RawRow = Record<string, string | undefined>;

export type PropertyRow = Record<string, any> & {
  id?: string;
  slug?: string;
  title?: string;
  project_name?: string;
  developer_name?: string;
  description?: string;
  segment?: string;
  listingFor?: string;
  status?: string;
  location?: string;
  locality?: string;
  address?: string;
  city?: string;
  pincode?: string;
  price?: number;
  price_min_inr?: number;
  price_max_inr?: number;
  bedrooms?: number | string;
  beds_options?: string;
  bathrooms?: number;
  areaSqft?: string | number;
  carpet_min_sqft?: number | string;
  carpet_max_sqft?: number | string;
  propertyType?: string;
  unit_types?: string;
  amenities_primary?: string;
  amenities_sports?: string;
  amenities_safety?: string;
  amenities_green?: string;
  images?: string[];
  gallery_image_urls?: string[] | string;
  hero_image_url?: string;
  isFeatured?: boolean;
  new_launch?: boolean;
  for_sale?: boolean;
  for_rent?: boolean;
  brochure_url?: string;
  floor_plan_urls?: string;
  site_plan_url?: string;
  price_list_url?: string;
  rera_id?: string;
  rera_url?: string;
  launch_date?: string;
  possession_quarter?: string;
  possession_year?: string | number;
  construction_stage?: string;
  total_acres?: string | number;
  num_towers?: string | number;
  floors_per_tower?: string | number;
  elevation_style?: string;
  architect?: string;
  contractor?: string;
  parking_type?: string;
  parking_ratio?: string;
  water_supply?: string;
  power_backup?: string;
  fire_safety?: string;
  sales_person_name?: string;
  sales_phone?: string;
  sales_email?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  featured?: string | boolean;
  priority_rank?: string | number;
  notes?: string;
};

// --- env + URL resolver ------------------------------------------------------
const SHEET_RAW = (import.meta.env.VITE_SHEET_ID || "").toString().trim();
const SHEET_GID = (import.meta.env.VITE_SHEET_GID || "0").toString().trim();
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 5);
const APPSCRIPT_EXEC = (import.meta.env.VITE_SHEET_EXEC || "").toString().trim();

/** Resolve CSV export url for given sheet id and gid */
function csvUrlFromId(sheetId: string, gid: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}
function resolveCsvUrl(): string | null {
  if (!SHEET_RAW) return null;
  if (/^https?:\/\//i.test(SHEET_RAW)) return SHEET_RAW;
  return csvUrlFromId(SHEET_RAW, SHEET_GID);
}

// --- helpers ---------------------------------------------------------------
function parsePrice(v?: string) {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  // values like "11.69 Cr" or "14.79 Cr onwards" or "1,16,90,000"
  if (s.includes("cr")) {
    const n = Number((s.match(/[\d.,]+/)?.[0] || "").replace(/,/g, ""));
    return Number.isFinite(n) ? Math.round(n * 10000000) : undefined;
  }
  if (s.includes("lakh") || s.includes("lac")) {
    const n = Number((s.match(/[\d.,]+/)?.[0] || "").replace(/,/g, ""));
    return Number.isFinite(n) ? Math.round(n * 100000) : undefined;
  }
  // plain number
  const digits = s.replace(/[^\d.]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

function cleanNum(v?: string) {
  if (!v && v !== 0) return undefined;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

// --- CSV parsing ------------------------------------------------------------
function parseCSV(text: string): RawRow[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === "," && !inQuotes) { cur.push(cell); cell = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cell.length || cur.length) { cur.push(cell); rows.push(cur); cur = []; cell = ""; }
      if (ch === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cell += ch;
  }
  if (cell.length || cur.length) { cur.push(cell); rows.push(cur); }

  if (!rows.length) return [];
  const header = rows.shift()!.map(h => String(h || "").trim().toLowerCase());
  return rows
    .filter(r => r.length && r.some(x => String(x || "").trim().length))
    .map(cols => {
      const obj: RawRow = {};
      header.forEach((h, i) => { obj[h] = (cols[i] ?? "").toString().trim(); });
      return obj;
    });
}

// --- normalizers -----------------------------------------------------------
function normalizeSegment(s?: string) {
  if (!s) return undefined;
  const t = s.toLowerCase();
  if (t.includes("res")) return "residential";
  if (t.includes("com") || t.includes("office")) return "commercial";
  return undefined;
}
function normalizeFor(s?: string) {
  if (!s) return undefined;
  const t = s.toLowerCase();
  if (t.includes("rent") || t.includes("lease")) return "rent";
  if (t.includes("launch") || t.includes("under") || t === "uc") return "under-construction";
  if (t.includes("sale") || t.includes("resale") || t.includes("buy")) return "resale";
  return undefined;
}
function splitList(v?: string) {
  if (!v) return [];
  return v.split(/[|,;]+/).map(x => x.trim()).filter(Boolean);
}
function normalizeImages(v?: string) {
  if (!v) return [];
  const raw = String(v).trim();
  if (!raw) return [];
  // direct URLs or comma/pipe separated
  if (raw.includes(",") || raw.includes("|") || /\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(raw)) {
    return raw.split(/[|,;]+/).map(s => s.trim()).filter(Boolean);
  }
  // FOLDER::prefix/*
  if (/^FOLDER::/i.test(raw)) {
    const folder = raw.replace(/^FOLDER::/i, "").replace(/^\/+/, "");
    return Array.from({ length: 10 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }
  if (raw.endsWith("/*")) {
    const folder = raw.slice(0, -2).replace(/^\/+/, "");
    return Array.from({ length: 10 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }
  // folder-like path without extension
  if (/.+\/.+/.test(raw) && !/\.[a-z0-9]+$/i.test(raw)) {
    const folder = raw.replace(/^\/+/, "");
    return Array.from({ length: 10 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }
  // single url or filename
  return [raw];
}

function makeSlug(s?: string) {
  if (!s) return "";
  return String(s).toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
}

// --- row mapper (maps many possible header names to fields expected by frontend) ---
function getField(r: RawRow, ...keys: string[]) {
  for (const k of keys) {
    const key = k.toLowerCase();
    if (r[key] !== undefined) return r[key];
  }
  return undefined;
}

function mapRow(r: RawRow): PropertyRow | null {
  if (!r) return null;

  // many possible header names searched for each logical field:
  const project_id = (getField(r, "project_id", "id", "project id", "projectid") || "").toString().trim();
  const project_name = (getField(r, "project_name", "project name", "name", "title") || "").toString().trim();
  const slugRaw = (getField(r, "slug", "slugify") || "").toString().trim();

  const slug = slugRaw || makeSlug(project_id || project_name);
  const title = project_name || project_id || (getField(r, "title") || "").toString().trim() || slug;

  const developer_name = getField(r, "developer_name", "developer", "builder", "developer name") || undefined;
  const locality = getField(r, "locality", "micro_location", "neighborhood") || undefined;
  const city = getField(r, "city", "town", "location_city") || undefined;
  const address = getField(r, "address", "site_address", "location") || undefined;
  const pincode = getField(r, "pincode", "pin", "pin code", "postal_code") || undefined;

  const unit_types = getField(r, "unit_types", "units", "configurations") || undefined;
  const beds_options = getField(r, "beds_options", "beds_options", "beds options", "beds", "bedrooms") || undefined;

  const carpet_min_sqft = cleanNum(getField(r, "carpet_min_sqft", "carpet min sqft", "carpet_min", "carpetmin") as any);
  const carpet_max_sqft = cleanNum(getField(r, "carpet_max_sqft", "carpet max sqft", "carpet_max", "carpetmax") as any);

  const price_min_inr = parsePrice(getField(r, "price_min_inr", "price min inr", "price_min", "price_min_inr") as any);
  const price_max_inr = parsePrice(getField(r, "price_max_inr", "price max inr", "price_max", "price_max_inr") as any);

  const price_generic = parsePrice(getField(r, "price", "all_inclusive_price", "all inclusive price") as any);

  const bedsNumeric = cleanNum(getField(r, "bedrooms", "beds", "beds_options") as any);

  const gallery_raw = getField(r, "gallery_image_urls", "gallery", "gallery_image", "gallery urls", "gallery_image_urls");
  const images_raw = getField(r, "images", "image", "image_urls", "gallery_image_urls");

  const images = normalizeImages(gallery_raw || images_raw || getField(r, "hero_image_url", "hero", "hero_image") || "");

  const amenities_primary = getField(r, "amenities_primary", "amenities", "amenities & facilities", "amenities_primary") || "";
  const amenities_sports = getField(r, "amenities_sports", "amenities_sport") || "";
  const amenities_safety = getField(r, "amenities_safety", "safety") || "";
  const amenities_green = getField(r, "amenities_green", "green", "landscape") || "";

  const brochure_url = getField(r, "brochure_url", "brochure", "brochure link") || undefined;
  const floor_plan_urls = getField(r, "floor_plan_urls", "floorplans", "floor_plan") || undefined;
  const site_plan_url = getField(r, "site_plan_url", "siteplan", "site_plan") || undefined;
  const price_list_url = getField(r, "price_list_url", "price_list", "pricelist") || undefined;

  const rera_id = getField(r, "rera_id", "rera", "rera id") || undefined;
  const rera_url = getField(r, "rera_url", "rera_url", "rera link") || undefined;

  const launch_date = getField(r, "launch_date", "launch") || undefined;
  const possession_quarter = getField(r, "possession_quarter", "possession") || undefined;
  const possession_year = getField(r, "possession_year", "possession year") || undefined;
  const construction_stage = getField(r, "construction_stage", "construction stage") || undefined;

  const total_acres = getField(r, "total_acres", "area_acres", "total area (acres)") || undefined;
  const num_towers = getField(r, "num_towers", "towers", "no_of_towers") || undefined;
  const floors_per_tower = getField(r, "floors_per_tower", "floors_per_tower", "floors/tower") || undefined;

  const elevation_style = getField(r, "elevation_style", "elevation", "elevation style") || undefined;
  const architect = getField(r, "architect", "design by", "architect") || undefined;
  const contractor = getField(r, "contractor", "main contractor", "contractor") || undefined;

  const parking_type = getField(r, "parking_type", "parking") || undefined;
  const parking_ratio = getField(r, "parking_ratio", "parking ratio", "car parking ratio") || undefined;
  const water_supply = getField(r, "water_supply", "water supply") || undefined;
  const power_backup = getField(r, "power_backup", "power backup") || undefined;
  const fire_safety = getField(r, "fire_safety", "fire safety") || undefined;

  const hero_image_url = getField(r, "hero_image_url", "hero image", "hero") || undefined;

  const sales_person_name = getField(r, "sales_person_name", "sales person", "sales_person") || undefined;
  const sales_phone = getField(r, "sales_phone", "sales phone", "phone", "sales_phone") || undefined;
  const sales_email = getField(r, "sales_email", "sales email", "email", "sales_email") || undefined;

  const meta_title = getField(r, "meta_title", "meta title") || undefined;
  const meta_description = getField(r, "meta_description", "meta description") || undefined;
  const canonical_url = getField(r, "canonical_url", "canonical") || undefined;
  const notes = getField(r, "notes", "note", "remarks") || undefined;

  const featured = getField(r, "featured", "is_featured") || undefined;
  const priority_rank = getField(r, "priority_rank", "priority") || undefined;
  const status = getField(r, "status", "current status") || undefined;
  const segment = normalizeSegment(getField(r, "segment", "segment", "property segment") as any);
  const listingFor = normalizeFor(getField(r, "listingFor", "for", "listing for", "status") as any);

  const result: PropertyRow = {
    id: project_id || makeSlug(project_name || title),
    slug,
    title,
    project_name: project_name || title,
    developer_name,
    locality,
    city,
    address,
    pincode,
    unit_types: unit_types || undefined,
    beds_options: beds_options || (bedsNumeric ? String(bedsNumeric) : undefined),
    carpet_min_sqft: carpet_min_sqft || undefined,
    carpet_max_sqft: carpet_max_sqft || undefined,
    price_min_inr: price_min_inr,
    price_max_inr: price_max_inr,
    price: price_generic || price_min_inr || undefined,
    bedrooms: bedsNumeric ? Math.round(bedsNumeric) : (bedsNumeric === 0 ? 0 : undefined),
    bathrooms: cleanNum(getField(r, "bathrooms", "baths") as any),
    areaSqft: (carpet_min_sqft || carpet_max_sqft) ? ( (carpet_min_sqft ? String(carpet_min_sqft) : "") + (carpet_max_sqft ? " - " + String(carpet_max_sqft) : "") + " sqft") : undefined,
    propertyType: getField(r, "propertyType", "type") || undefined,
    amenities_primary: String(amenities_primary || "").trim(),
    amenities_sports: String(amenities_sports || "").trim(),
    amenities_safety: String(amenities_safety || "").trim(),
    amenities_green: String(amenities_green || "").trim(),
    images,
    gallery_image_urls: images,
    hero_image_url,
    brochure_url: brochure_url || undefined,
    floor_plan_urls: floor_plan_urls || undefined,
    site_plan_url: site_plan_url || undefined,
    price_list_url: price_list_url || undefined,
    rera_id: rera_id || undefined,
    rera_url: rera_url || undefined,
    launch_date: launch_date || undefined,
    possession_quarter: possession_quarter || undefined,
    possession_year: possession_year || undefined,
    construction_stage: construction_stage || undefined,
    total_acres: total_acres || undefined,
    num_towers: num_towers || undefined,
    floors_per_tower: floors_per_tower || undefined,
    elevation_style: elevation_style || undefined,
    architect: architect || undefined,
    contractor: contractor || undefined,
    parking_type: parking_type || undefined,
    parking_ratio: parking_ratio || undefined,
    water_supply: water_supply || undefined,
    power_backup: power_backup || undefined,
    fire_safety: fire_safety || undefined,
    sales_person_name: sales_person_name || undefined,
    sales_phone: sales_phone || undefined,
    sales_email: sales_email || undefined,
    meta_title,
    meta_description,
    canonical_url,
    featured: typeof featured === "string" ? toBool(featured) : !!featured,
    priority_rank,
    notes,
    status,
    segment,
    listingFor,
  };

  return result;
}

// --- fetch + caching --------------------------------------------------------
let cache: { at: number; data: PropertyRow[] } | null = null;

async function fetchTextUrl(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

/**
 * fetchSheet:
 * - If APPSCRIPT_EXEC is set, call that with ?sheet=New_Launch_Properties and parse JSON {result,data}
 * - Else use CSV export URL (sheet id + gid) and parse CSV
 */
export async function fetchSheet(): Promise<PropertyRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data;

  // prefer Apps Script exec if configured and looks like a URL
  try {
    let rawRows: RawRow[] = [];

    if (APPSCRIPT_EXEC && /^https?:\/\//i.test(APPSCRIPT_EXEC)) {
      // try apps script JSON endpoint
      const url = `${APPSCRIPT_EXEC}?sheet=New_Launch_Properties`;
      const txt = await fetchTextUrl(url);
      try {
        const json = JSON.parse(txt);
        // support both {result:"ok", data:[...]} or plain array
        const arr = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
        rawRows = arr.map((x: any) => {
          // normalize keys to lowercase so parseCSV-like logic works
          const out: RawRow = {};
          Object.keys(x || {}).forEach(k => { out[String(k).toLowerCase()] = (x[k] ?? "").toString(); });
          return out;
        });
      } catch (err) {
        console.warn("APPSCRIPT returned non-json or unexpected shape; falling back to CSV. raw:", txt);
        rawRows = [];
      }
    }

    if (!rawRows.length) {
      const url = resolveCsvUrl();
      if (!url) {
        console.warn("No VITE_SHEET_ID or APPSCRIPT_EXEC configured.");
        cache = { at: Date.now(), data: [] };
        return [];
      }
      const txt = await ( /^https?:\/\//i.test(SHEET_RAW) ? fetchTextUrl(url) : fetchTextUrl(csvUrlFromId(SHEET_RAW, SHEET_GID)) );
      rawRows = parseCSV(txt);
    }

    const rows = rawRows.map(mapRow).filter((x): x is PropertyRow => !!x);

    // filter out sold/rented/inactive - keep only active launches etc.
    const filtered = rows.filter(r => {
      const s = (r.status || "").toString().toLowerCase();
      return !["rented", "sold", "inactive"].includes(s);
    });

    cache = { at: Date.now(), data: filtered };
    return filtered;
  } catch (err) {
    console.warn("Failed to load sheet — returning empty array.", err);
    cache = { at: Date.now(), data: [] };
    return [];
  }
}
