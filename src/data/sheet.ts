// src/data/sheet.ts
// Robust CSV loader for Residential / Commercial listings

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
    .replace(/[^\w\s]/g, "")
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
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  areaSqft?: string;
  propertyType?: string;
  images?: string;
  isFeatured?: string | boolean;
};

let cache: { at: number; data: PropertyRow[] } | null = null;
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 2);

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    rows.push(cols.map(c => c.replace(/^"|"$/g, "").trim()));
  }
  return rows;
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

    const headers = csvRows[0].map(h => h.trim());
    const rows = csvRows.slice(1).map(r => {
      const obj: RawRow = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj as PropertyRow;
    });

    cache = { at: now, data: rows };
    return rows;
  } catch (err) {
    console.error("⚠️ fetchSheet error:", err);
    return [];
  }
}
