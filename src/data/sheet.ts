// src/data/sheet.ts
// -----------------
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
  price?: number;       // rupees
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  propertyType?: string;
  amenities?: string[];
  images?: string[];    // first is cover
  isFeatured?: boolean;
};

// --- env + URL resolver ------------------------------------------------------
const SHEET_RAW = import.meta.env.VITE_SHEET_ID?.trim() || '';
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 10);

// Accept either a Sheet ID or a full publish/gviz URL
function resolveCsvUrl(): string | null {
  if (!SHEET_RAW) return null;

  // full URL pasted -> use as is
  if (/^https?:\/\//i.test(SHEET_RAW)) return SHEET_RAW;

  // plain ID -> use gviz CSV (CORS-friendlier)
  return `https://docs.google.com/spreadsheets/d/${SHEET_RAW}/gviz/tq?tqx=out:csv&gid=0`;
}

// --- numeric helpers ---------------------------------------------------------
function parsePrice(v?: string) {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();

  // “18.5 cr”
  if (s.includes('cr')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e7) : undefined;
  }
  // “2 lakh”, “2 lac”
  if (s.includes('lakh') || s.includes('lac')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e5) : undefined;
  }
  const n = Number(s.replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function cleanNum(v?: string) {
  if (!v) return undefined;
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

// --- CSV (robust enough for Google Sheets) -----------------------------------
function parseCSV(text: string): RawRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === ',' && !inQuotes) { row.push(cell); cell = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cell.length || row.length) { row.push(cell); rows.push(row); row = []; cell = ''; }
      if (ch === '\r' && text[i + 1] === '\n') i++;
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }

  if (!rows.length) return [];
  const header = rows.shift()!.map(h => h.trim().toLowerCase());

  return rows
    .filter(r => r.length && r.some(x => x.trim().length))
    .map(cols => {
      const obj: RawRow = {};
      header.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
      return obj;
    });
}

// --- normalizers --------------------------------------------------------------
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
  return v.split(/[|,]/).map(x => x.trim()).filter(Boolean);
}

// images: accept list, single url, or folder shorthand -> expand 1..8
function normalizeImages(v?: string) {
  if (!v) return [];
  const raw = v.trim();

  // list of images or has extensions -> use as-is
  if (raw.includes(',') || /\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(raw)) {
    return raw.split(/[|,]/).map(s => s.trim()).filter(Boolean);
  }

  // "FOLDER::residential/Beaumonde-903A"
  if (raw.startsWith('FOLDER::')) {
    const folder = raw.replace('FOLDER::', '').replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  // "residential/Beaumonde-903A/*"
  if (raw.endsWith('/*')) {
    const folder = raw.slice(0, -2).replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  // looks like a folder path (no extension, has slash)
  if (/.+\/.+/.test(raw) && !/\.[a-z0-9]+$/i.test(raw)) {
    const folder = raw.replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  return [raw];
}

function bool(v?: string) {
  if (!v) return false;
  const t = v.toLowerCase();
  return t === 'true' || t === '1' || t === 'yes';
}

// simple slug fallback when id is missing
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

function mapRow(r: RawRow): PropertyRow | null {
  const get = (k: string) =>
    r[k] ??
    r[k.toLowerCase()] ??
    r[k.replace(/\s+/g, '').toLowerCase()] ??
    undefined;

  const title = ((get('title') as string) || (get('name') as string) || 'Property').trim();
  const idCell = (get('id') as string) || '';
  const id = (idCell.trim() || slugify(title));

  const segment = normalizeSegment(get('segment') as string);
  const listingFor = normalizeFor(
    (get('listingFor') as string) ||
    (get('for') as string) ||
    (get('status') as string)
  );

  const description  = (get('description') as string) || undefined;
  const location     = (get('location') as string) || undefined;
  const areaLocality = (get('areaLocality') as string) || undefined;
  const propertyType = (get('propertyType') as string) || undefined;

  const amenities = splitList(get('amenities') as string);
  const images    = normalizeImages(get('images') as string);
  const isFeatured = bool(get('isFeatured') as string);

  const price     = parsePrice(get('price') as string);
  const bedrooms  = cleanNum(get('bedrooms') as string);
  const bathrooms = cleanNum(get('bathrooms') as string);
  const areaSqft  = cleanNum(get('areaSqft') as string);

  return {
    id,
    title,
    description,
    segment,
    listingFor,
    location,
    areaLocality,
    price,
    bedrooms: bedrooms ? Math.round(bedrooms) : undefined,
    bathrooms: bathrooms ? Math.round(bathrooms) : undefined,
    areaSqft: areaSqft ? Math.round(areaSqft) : undefined,
    propertyType,
    amenities,
    images,
    isFeatured,
  };
}

// --- fetch with cache ---------------------------------------------------------
let cache: { at: number; data: PropertyRow[] } | null = null;

export async function fetchSheet(): Promise<PropertyRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data;

  const url = resolveCsvUrl();
  if (!url) {
    console.warn('⚠️ No VITE_SHEET_ID provided');
    return [];
  }

  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const rows = parseCSV(text).map(mapRow).filter((x): x is PropertyRow => !!x);
    cache = { at: Date.now(), data: rows };
    return rows;
  } catch (err) {
    console.warn('⚠️ Failed to load sheet — using fallback.', err);
    return [];
  }
}
