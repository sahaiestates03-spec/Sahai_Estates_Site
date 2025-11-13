// src/data/sheet.ts
// Robust CSV loader for Residential / Commercial listings
// - normalizes headers
// - smart-parses image columns into either array or string
// - exposes common keys like images, gallery_image_urls, hero_image_url, slug

export function toBool(v: any): boolean {
  if (v === true || v === false) return v as boolean;
  if (typeof v === "number") return v !== 0;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return ["true", "yes", "y", "1"].includes(s);
}

export const slugify = (s?: string | null) =>
  (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

type RawRow = Record<string, string | undefined>;

export type PropertyRow = RawRow & {
  id?: string;
  slug?: string;
  title?: string;
  project_name?: string;
  location?: string;
  areaLocality?: string;
  price?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  areaSqft?: string | number;
  propertyType?: string;
  images?: string | string[]; // can be string or array
  gallery_image_urls?: string | string[];
  hero_image_url?: string;
  isFeatured?: string | boolean;
};

let cache: { at: number; data: PropertyRow[] } | null = null;
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 2);

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  // split lines but keep quoted commas safe (basic CSV parsing)
  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    rows.push(cols.map(c => c.replace(/^"|"$/g, "").trim()));
  }
  return rows;
}

/** try to convert a CSV cell value into array/string for images */
function parseImagesCell(cell?: string | undefined): string | string[] | undefined {
  if (!cell) return undefined;
  const t = cell.trim();
  if (!t) return undefined;

  // JSON array? try parse
  if (t.startsWith("[") && t.endsWith("]")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map((x: any) => (x == null ? "" : String(x).trim())).filter(Boolean);
    } catch { /* fallthrough */ }
  }

  // If contains separators, split into array
  if (t.indexOf("|") !== -1 || t.indexOf(";") !== -1 || (t.indexOf(",") !== -1 && !t.toUpperCase().includes('FOLDER::'))) {
    // split by common separators, but don't split folder shorthand "FOLDER::a,b" if inadvertently contains comma
    const parts = t.split(/[\|;]+|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
  }

  // otherwise return raw string (could be "FOLDER::folder/*" or single filename or url)
  return t;
}

/** map raw CSV headers -> normalized object */
function mapRow(headers: string[], row: string[]): PropertyRow {
  const out: RawRow = {};
  headers.forEach((h, i) => {
    out[h] = row[i] != null ? row[i] : undefined;
  });

  // derive some common keys (normalize)
  const lowerMap: Record<string, string | undefined> = {};
  Object.keys(out).forEach(k => {
    lowerMap[k.trim().toLowerCase()] = out[k];
  });

  // helper to pick first matching header
  const pick = (candidates: string[]) => {
    for (const cand of candidates) {
      if (lowerMap[cand] != null) return lowerMap[cand];
    }
    return undefined;
  };

  const imagesRaw = pick(["images", "gallery", "gallery_image_urls", "gallery_image_url", "image", "images_urls"]);
  const heroRaw = pick(["hero_image_url", "hero", "cover_image", "cover"]);
  const slugRaw = pick(["slug", "id", "project_id", "project_name", "title", "name"]);

  const imagesParsed = parseImagesCell(imagesRaw);
  const galleryParsed = imagesParsed; // duplicate for compatibility
  const heroParsed = heroRaw ? String(heroRaw).trim() : undefined;

  // build normalized object with both original raw keys and normalized ones
  const normalized: PropertyRow = {
    ...out,
    // normalized copies
    images: imagesParsed,
    gallery_image_urls: galleryParsed,
    hero_image_url: heroParsed,
    // basic fields
    id: (pick(["id", "project_id", "projectid", "project id"]) || slugRaw || "") as string,
    slug: typeof slugRaw === "string" ? slugify(slugRaw) : undefined,
    title: (pick(["title", "project_name", "name"]) || "") as string,
    project_name: (pick(["project_name", "project name"]) || undefined) as any,
    location: (pick(["location", "area", "locality", "city"]) || undefined) as any,
    price: (() => {
      const v = pick(["price", "price_inr", "price_min_inr", "price_min", "price_min_inr"]);
      if (!v) return undefined;
      const s = String(v).replace(/[^\d.-]/g, "");
      const n = Number(s);
      return Number.isFinite(n) ? n : v;
    })(),
    bedrooms: pick(["bedrooms", "bhk", "beds", "beds_options"]) as any,
    bathrooms: pick(["bathrooms", "baths"]) as any,
    areaSqft: pick(["areaSqft", "carpet_min_sqft", "carpet_max_sqft", "area", "carpet_area"]) as any,
    propertyType: pick(["propertytype", "property_type", "unit_type"]) as any,
    isFeatured: pick(["isfeatured", "featured", "is_featured"]) as any,
  };

  return normalized;
}

export async function fetchSheet(): Promise<PropertyRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data;

  const explicitCsv = (import.meta.env.VITE_LISTINGS_SHEET_CSV || "").toString().trim();
  const sheetId = (import.meta.env.VITE_SHEET_ID || "").trim();
  const gid = (import.meta.env.VITE_SHEET_GID || "").trim();
  const fallbackUrl = sheetId
    ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    : "";

  const urlToUse = explicitCsv || fallbackUrl;

  if (!urlToUse) {
    console.warn("⚠️ No Listings CSV configured.");
    return [];
  }

  try {
    const resp = await fetch(urlToUse, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();

    const csvRows = parseCSV(text);
    if (csvRows.length < 2) return [];

    // normalize headers to lowercase keys (no spaces)
    const headersRaw = csvRows[0].map(h => (h || "").toString().trim());
    const headers = headersRaw.map(h => h.toLowerCase().replace(/\s+/g, "_"));

    const rows = csvRows.slice(1).map(r => mapRow(headers, r));

    cache = { at: now, data: rows };
    return rows;
  } catch (err) {
    console.error("⚠️ fetchSheet error:", err);
    return [];
  }
}
