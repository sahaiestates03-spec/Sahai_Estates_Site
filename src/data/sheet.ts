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
const LOCAL_PREFIX = '/prop-pics/'

// ✅ NEW — intelligently resolve final CSV URL
function resolveCsvUrl(): string | null {
  if (!SHEET_RAW) return null

  // If user pasted a FULL publish-to-web URL → use AS-IS
  if (/^https?:\/\//i.test(SHEET_RAW)) {
    return SHEET_RAW
  }

  // Otherwise assume it's a plain Sheet ID
  return `https://docs.google.com/spreadsheets/d/${SHEET_RAW}/gviz/tq?tqx=out:csv&gid=0`
}

function parsePrice(v?: string) {
  if (!v) return undefined
  const s = v.toString().trim().toLowerCase()
  if (s.includes('cr')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''))
    return Number.isFinite(n) ? Math.round(n * 1e7) : undefined
  }
  if (s.includes('lakh') || s.includes('lac')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''))
    return Number.isFinite(n) ? Math.round(n * 1e5) : undefined
  }
  const n = Number(s.replace(/[^\d]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function cleanNum(v?: string) {
  if (!v) return undefined;
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}


function parseCSV(text: string): RawRow[] {
  // RFC4180-ish CSV parser that handles quotes, commas, CRLF
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      // Escaped quote inside a quoted cell ("")
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    // Comma separates cells when we are not in quotes
    if (ch === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    // Newline (CR or LF) ends the row when not in quotes
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // Push the last cell if this line had any content
      if (cell.length || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      }
      // Skip the paired \n after \r\n
      if (ch === '\r' && text[i + 1] === '\n') i++;
      continue;
    }

    cell += ch;
  }

  // Flush any remaining cell/row
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];

  // Build objects with case-insensitive headers
  const headerLine = rows.shift()!;
  const headers = headerLine.map(h => h.trim().toLowerCase());

  return rows
    .filter(r => r.length && r.some(x => x.trim().length))
    .map(cols => {
      const obj: RawRow = {};
      headers.forEach((h, i) => {
        // Trim surrounding spaces
        let v = (cols[i] ?? '').trim();
        obj[h] = v;
      });
      return obj;
    });
}


function normalizeSegment(s?: string) {
  if (!s) return undefined
  const t = s.toLowerCase()
  if (t.includes('res')) return 'residential'
  if (t.includes('com') || t.includes('office')) return 'commercial'
  return undefined
}

function normalizeFor(s?: string) {
  if (!s) return undefined
  const t = s.toLowerCase()
  if (t.includes('rent') || t.includes('lease')) return 'rent'
  if (t.includes('launch') || t.includes('under') || t === 'uc') return 'under-construction'
  if (t.includes('sale') || t.includes('resale') || t.includes('buy')) return 'resale'
  return undefined
}

function splitList(v?: string) {
  if (!v) return []
  return v
    .split(/[|,]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

function normalizeImages(v?: string) {
  return splitList(v).map((x) =>
    x.startsWith('http') || x.startsWith('/') ? x : LOCAL_PREFIX + x
  )
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
