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
  if (!v) return 0
  return Number(v.replace(/[^\d.]/g, ''))
}

function parseCSV(text: string): RawRow[] {
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean)
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase())
  return lines.map((l) => {
    const cells = l.split(',')
    const row: RawRow = {}
    headers.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()))
    return row
  })
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

function mapRow(r: RawRow): PropertyRow | null {
  const get = (k: string) =>
    r[k] ??
    r[k.toLowerCase()] ??
    r[k.replace(/\s+/g, '').toLowerCase()]

  const id = (get('id') as string) || crypto.randomUUID()
  const title = (get('title') as string) || 'Property'
  const segment = normalizeSegment(get('segment') as string)
  const listingFor = normalizeFor(
    (get('listingFor') as string) ||
      (get('for') as string) ||
      (get('status') as string)
  )

  return {
    id,
    title,
    segment,
    listingFor,
    description: get('description') as string,
    location: get('location') as string,
    areaLocality: get('arealocality') as string,
    price: parsePrice(get('price') as string),
    bedrooms: cleanNum(get('bedrooms') as string),
    bathrooms: cleanNum(get('bathrooms') as string),
    areaSqft: cleanNum(get('areasqft') as string),
    propertyType: get('propertytype') as string,
    amenities: splitList(get('amenities') as string),
    images: normalizeImages(get('images') as string),
    isFeatured: bool(get('isFeatured') as string),
  }
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
