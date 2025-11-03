// src/data/sheet.ts
type RawRow = Record<string, string | undefined>

export type PropertyRow = {
  id: string
  title: string
  description?: string
  segment?: 'residential' | 'commercial'
  listingFor?: 'resale' | 'rent' | 'under-construction'
  status?: string
  location?: string
  areaLocality?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  areaSqft?: number
  propertyType?: string
  amenities?: string[]
  images?: string[]
  isFeatured?: boolean
}

const SHEET_RAW = import.meta.env.VITE_SHEET_ID?.trim() || ''
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN || 10)
// src/data/sheet.ts (add or replace these helpers)

// Prefix for local public folder
const LOCAL_PREFIX = '/prop-pics/';

function splitList(v?: string) {
  if (!v) return [];
  return v
    .split(/[|,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// Convert any Google Drive style link to a direct "view" URL that loads as an image.
function normalizeImages(v?: string) {
  if (!v) return [];
  const raw = v.trim();

  // already a list of URLs/paths
  if (raw.includes(',') || raw.includes('.jpg') || raw.includes('.jpeg') || raw.includes('.png')) {
    return raw.split(/[|,]/).map(s => s.trim()).filter(Boolean);
  }

  // FOLDER::prefix
  if (raw.startsWith('FOLDER::')) {
    const folder = raw.replace('FOLDER::', '').replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  // "folder/*" shorthand
  if (raw.endsWith('/*')) {
    const folder = raw.slice(0, -2).replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  // looks like a folder path (no extension, has slash)
  if (/.+\/.+/.test(raw) && !/\.[a-z0-9]+$/i.test(raw)) {
    const folder = raw.replace(/^\/+/, '');
    return Array.from({ length: 8 }, (_, i) => `/prop-pics/${folder}/${i + 1}.jpg`);
  }

  // single http or single path
  return [raw];
}


function isHttp(u: string) {
  return u.startsWith('http://') || u.startsWith('https://');
}

function hasExt(u: string) {
  return /\.\w{2,5}$/.test(u);
}

/**
 * Accepts:
 *  - Comma/pipe separated file paths (relative or http)
 *  - Single folder shorthand "residential/Beaumonde-903A" or "residential/Beaumonde-903A/*"
 *  - Google Drive URLs (we convert)
 * Returns array of strings; if a single folder is provided, we store it as a special marker
 * "FOLDER::<path>" so the component can discover images at runtime.
 */
function normalizeImages(v?: string): string[] {
  if (!v) return [];
  const single = v.trim();

  // Allow "folder/*" as an explicit shorthand
  if (single.endsWith('/*')) {
    const folder = single.slice(0, -2).replace(/^\/+/, '');
    return [`FOLDER::${folder}`];
  }

  // If it looks like a single folder (no comma, no extension, not http)
  if (!single.includes(',') && !hasExt(single) && !isHttp(single)) {
    return [`FOLDER::${single.replace(/^\/+/, '')}`];
  }

  // else normal list
  const arr = splitList(v);
  return arr.map((x) => {
    if (isHttp(x)) return normalizeGoogleDriveUrl(x);
    if (x.startsWith('/')) return x; // absolute from public root
    return LOCAL_PREFIX + x;         // relative -> /prop-pics/<x>
  });
}


function bool(v?: string) {
  if (!v) return false
  const t = v.toLowerCase()
  return t === 'true' || t === '1' || t === 'yes'
}

// src/data/sheet.ts

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, '-')     // non-word -> hyphen
    .replace(/^-+|-+$/g, '');    // trim hyphens
}



// ... keep parsePrice, splitList, normalizeImages, etc. as you already have ...

function mapRow(r: RawRow): PropertyRow | null {
  const get = (k: string) =>
    r[k] ??
    r[k.toLowerCase()] ??
    r[k.replace(/\s+/g, '').toLowerCase()] ??
    undefined;

  const title = ((get('title') as string) || (get('name') as string) || 'Property').trim();
  const idCell = (get('id') as string) || '';
  const id = idCell.trim() || slugify(title);   // <- fallback to slug if id is missing

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
  const isFeatured = ['true', '1', 'yes'].includes(((get('isFeatured') as string) || '').toLowerCase());

  const price = parsePrice(get('price') as string);
  const bedrooms = cleanNum(get('bedrooms') as string);
  const bathrooms = cleanNum(get('bathrooms') as string);
  const areaSqft = cleanNum(get('areaSqft') as string);

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


let cache: { at: number; data: PropertyRow[] } | null = null

export async function fetchSheet(): Promise<PropertyRow[]> {
  const now = Date.now()
  if (cache && now - cache.at < CACHE_MIN * 60_000) return cache.data

  const url = resolveCsvUrl()
  if (!url) {
    console.warn('⚠️ No VITE_SHEET_ID provided')
    return []
  }

  try {
    const resp = await fetch(url, { cache: 'no-store' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const rows = parseCSV(await resp.text())
      .map(mapRow)
      .filter(Boolean) as PropertyRow[]

    cache = { at: Date.now(), data: rows }
    return rows
  } catch (err) {
    console.warn('⚠️ Failed to load sheet — using fallback.', err)
    return []
  }
}
