// src/data/sheet.ts
// Reads properties from a Google Sheet (published as CSV) and maps into the
// shape your site already understands. Falls back handled in PropertiesPage.

export type SheetProperty = {
  id: string;
  title: string;
  description?: string;
  segment?: 'residential' | 'commercial';
  listingFor?: 'resale' | 'rent' | 'under-construction';
  status?: string;
  location?: string;
  areaLocality?: string;
  price?: number;
  bedrooms?: number; // we will expose bhk for filters
  bathrooms?: number;
  areaSqft?: number;
  propertyType?: string; // we will expose type from this
  amenities?: string[];
  images?: string[];
  isFeatured?: boolean;
};

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const GID = import.meta.env.VITE_SHEET_GID ?? '0';
const CACHE_MIN = Number(import.meta.env.VITE_SHEET_CACHE_MIN ?? '10');

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

const CACHE_KEY = 'sheet_properties_cache_v2';
const CACHE_AT = 'sheet_properties_cache_at_v2';

const lc = (v: any) => (v == null ? '' : String(v).toLowerCase().trim());
const parseNum = (v?: string) => {
  if (!v) return undefined;
  const n = Number((v + '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};
const parseBool = (v?: string) => {
  const s = lc(v);
  return s === 'true' || s === '1' || s === 'yes';
};

function statusToFor(status?: string, listingFor?: string): 'resale' | 'rent' | 'under-construction' | undefined {
  // listingFor wins; otherwise infer from status
  const lf = lc(listingFor);
  if (/(rent|lease)/.test(lf)) return 'rent';
  if (/(under.?construction|new\s*launch|pre.?launch)/.test(lf)) return 'under-construction';
  if (lf) return lf as any;

  const s = lc(status);
  if (/(rent|lease)/.test(s)) return 'rent';
  if (/(under.?construction|new\s*launch|pre.?launch)/.test(s)) return 'under-construction';
  if (/(sale|sell|buy|ready\s*to\s*move|available|possession)/.test(s)) return 'resale';
  return undefined;
}

export async function fetchSheetProperties(): Promise<any[]> {
  if (!SHEET_ID) return [];

  // Try localStorage cache first
  try {
    const at = localStorage.getItem(CACHE_AT);
    const json = localStorage.getItem(CACHE_KEY);
    if (at && json) {
      const ageMin = (Date.now() - Number(at)) / 60000;
      if (ageMin < CACHE_MIN) return JSON.parse(json);
    }
  } catch {}

  const res = await fetch(CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Sheet fetch failed');
  const csv = await res.text();

  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1);

  const items: any[] = rows.map((line) => {
    // Basic CSV split. If you later need fully robust parsing, we can swap to PapaParse.
    const cols = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cols[i] ?? '').trim()));

    const imgList = row['images']
      ? row['images'].split('|').join(',').split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const amenList = row['amenities']
      ? row['amenities'].split('|').join(',').split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const obj: SheetProperty = {
      id: row['id'] || crypto.randomUUID(),
      title: row['title'] || 'Property',
      description: row['description'],
      segment: ((): any => {
        const s = lc(row['segment']);
        if (s.includes('commercial')) return 'commercial';
        if (s.includes('residential')) return 'residential';
        return undefined;
      })(),
      listingFor: statusToFor(row['status'], row['listingfor']),
      status: row['status'],
      location: row['location'],
      areaLocality: row['arealocality'],
      price: parseNum(row['price']),
      bedrooms: parseNum(row['bedrooms']),
      bathrooms: parseNum(row['bathrooms']),
      areaSqft: parseNum(row['areasqft']),
      propertyType: row['propertytype'],
      amenities: amenList,
      images: imgList,
      isFeatured: parseBool(row['isfeatured']),
    };

    // Normalize for the site (filters & cards)
    const normalized: any = {
      ...obj,
      bhk: obj.bedrooms,
      type: obj.propertyType,
      cover: obj.images?.[0],
      // Filters expect "segment" & "status" (resale/rent/under-construction)
      segment: obj.segment,
      status: obj.listingFor,
      // Prefer location → areaLocality fallback
      location: obj.location || obj.areaLocality || '',
    };

    return normalized;
  });

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(CACHE_AT, String(Date.now()));
  } catch {}

  return items;
}
