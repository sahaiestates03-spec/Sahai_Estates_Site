// src/data/sheet.ts
type RawRow = Record<string, string | undefined>;

export type PropertyRow = {
  id: string;
  title: string;
  description?: string;
  segment?: 'residential' | 'commercial';
  listingFor?: 'resale' | 'rent' | 'under-construction';
  status?: string;
  location?: string;
  areaLocality?: string;
  price?: number; // rupees
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  propertyType?: string;
  amenities?: string[];
  images?: string[]; // first one is card cover
  isFeatured?: boolean;
};

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const GID = import.meta.env.VITE_SHEET_GID || '0';
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 10);

const CSV_URLS = [
  // normal export
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`,
  // gviz export (more CORS-friendly)
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`,
  // publish-to-web export
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv&gid=${GID}`,
];

const LOCAL_PREFIX = '/prop-pics/';

// Replace cleanNum/toFloat usage with this:
function parsePrice(v?: string) {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();

  // If it says "cr" (crore)
  if (s.includes('cr')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e7) : undefined;
  }

  // If it says "lakh" / "lac"
  if (s.includes('lakh') || s.includes('lac')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e5) : undefined;
  }

  // Otherwise treat as rupees with optional commas/₹
  const n = Number(s.replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}


function toInt(v?: string) {
  const n = cleanNum(v);
  return n ? Math.round(n) : undefined;
}

function toFloat(v?: string) {
  const n = cleanNum(v);
  return n ? n : undefined;
}

function parseCSV(text: string): RawRow[] {
  // simple CSV; Google Sheets CSV is safe (no crazy quotes in your sheet)
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
  return lines.map((l) => {
    const cells = l.split(','); // OK for our sheet
    const row: RawRow = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()));
    return row;
  });
}

function normalizeSegment(s?: string) {
  if (!s) return undefined;
  const t = s.toLowerCase();
  if (t.includes('res')) return 'residential';
  if (t.includes('com') || t.includes('office')) return 'commercial';
  return undefined;
}

function normalizeFor(s?: string) {
  if (!s) return undefined;
  const t = s.toLowerCase();
  if (t.includes('rent') || t.includes('lease')) return 'rent';
  if (t.includes('launch') || t.includes('under') || t === 'uc') return 'under-construction';
  if (t.includes('sale') || t.includes('resale') || t.includes('buy')) return 'resale';
  return undefined;
}

function splitList(v?: string) {
  if (!v) return [];
  return v
    .split(/[|,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeImages(v?: string) {
  const arr = splitList(v);
  return arr.map((x) => {
    if (x.startsWith('http://') || x.startsWith('https://') || x.startsWith('/')) return x;
    // treat as file in /public/prop-pics
    return LOCAL_PREFIX + x;
  });
}

function bool(v?: string) {
  if (!v) return false;
  const t = v.toLowerCase();
  return t === 'true' || t === '1' || t === 'yes';
}

function mapRow(r: RawRow): PropertyRow | null {
  // Accept flexible headers
  const get = (k: string) =>
    r[k] ??
    r[k.toLowerCase()] ??
    r[k.replace(/\s+/g, '').toLowerCase()] ??
    undefined;

  const id = (get('id') as string) || crypto.randomUUID();
  const title = (get('title') as string) || (get('name') as string) || 'Property';

  const segment = normalizeSegment(get('segment') as string);
  const listingFor = normalizeFor(
    (get('listingFor') as string) ||
    (get('for') as string) ||
    (get('status') as string)
  );

  const description = (get('description') as string) || undefined;
  const location = (get('location') as string) || undefined;
  const areaLocality = (get('areaLocality') as string) || undefined;
  const propertyType = (get('propertyType') as string) || undefined;
  const amenities = splitList(get('amenities') as string);
  const images = normalizeImages(get('images') as string);
  const isFeatured = bool(get('isFeatured') as string);

  const price = parsePrice(get('price') as string); // in rupees
  const bedrooms = cleanNum(get('bedrooms') as string) ? Number(cleanNum(get('bedrooms') as string)) : undefined;
  const bathrooms = cleanNum(get('bathrooms') as string) ? Number(cleanNum(get('bathrooms') as string)) : undefined;
  const areaSqft = cleanNum(get('areaSqft') as string) ? Number(cleanNum(get('areaSqft') as string)) : undefined;

  return {
    id,
    title,
    description,
    segment,
    listingFor,
    location,
    areaLocality,
    price,
    bedrooms,
    bathrooms,
    areaSqft,
    propertyType,
    amenities,
    images,
    isFeatured,
  };
}

let cache: { at: number; data: PropertyRow[] } | null = null;

export async function fetchSheet(): Promise<PropertyRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data;

  let lastErr: unknown;
  for (const url of CSV_URLS) {
    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const rows = parseCSV(text)
        .map(mapRow)
        .filter((x): x is PropertyRow => !!x);
      cache = { at: Date.now(), data: rows };
      return rows;
    } catch (e) {
      lastErr = e;
    }
  }
  console.warn('Could not load Sheet. Using fallback data.', lastErr);
  return []; // PropertiesPage already shows a red note in this case
}
