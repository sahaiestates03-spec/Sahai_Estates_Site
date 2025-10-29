import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchSheetProperties } from '../data/sheet';
import * as DATA from '../data/mockData';

type QFor = 'resale' | 'rent' | 'under-construction';
type QSegment = 'residential' | 'commercial';

// ---------- helpers ----------
const lc = (v: any) => (v == null ? '' : String(v).toLowerCase().trim());
function num(v?: string | null) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function prettyFor(f: QFor) {
  if (f === 'resale') return 'Buy';
  if (f === 'rent') return 'Rent';
  return 'Under Construction';
}
function formatINR(n: number) {
  return n.toLocaleString('en-IN');
}
function formatCr(n: number) {
  return (n / 1e7).toFixed(2);
}
function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-sm text-gray-800">
      {label}
      <button onClick={onClear} className="text-gray-400 hover:text-gray-600" aria-label="Clear filter">
        ×
      </button>
    </span>
  );
}

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();

  // --- new: sheet state ---
  const [sheetItems, setSheetItems] = useState<any[] | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSheetProperties()
      .then((list) => {
        if (alive) setSheetItems(list);
      })
      .catch((err) => {
        if (alive) setSheetError(String(err));
        setSheetItems([]); // still render fallback
      });
    return () => {
      alive = false;
    };
  }, []);

  // Use sheet if available, else mockData fallback
  const all: any[] =
    (sheetItems && sheetItems.length > 0 ? sheetItems : []) ||
    (DATA as any).properties ||
    (DATA as any).list ||
    (DATA as any).default ||
    [];

  const q = useMemo(() => {
    const segment = (params.get('segment') as QSegment | null) || undefined;
    const forWhat = (params.get('for') as QFor | null) || undefined;
    const location = params.get('location') || undefined;
    const min = num(params.get('min'));
    const max = num(params.get('max'));
    const bhk = params.get('bhk') || undefined;
    const ptype = params.get('ptype') || undefined;
    return { segment, forWhat, location, min, max, bhk, ptype };
  }, [params]);

  // -------- relaxed filter (keeps unknowns instead of excluding) --------
  const filtered = useMemo(() => {
    const mapStatus = (raw?: any): 'resale' | 'rent' | 'under-construction' | undefined => {
      const s = lc(raw);
      if (!s) return undefined;
      if (/(rent|lease|to let|for rent)/i.test(s)) return 'rent';
      if (/(under.?construction|new\s*launch|pre.?launch|launch)/i.test(s)) return 'under-construction';
      if (/(buy|sale|sell|for\s*sale|ready\s*to\s*move|available|possession)/i.test(s)) return 'resale';
      return undefined;
    };

    const mapSegment = (p: any): 'residential' | 'commercial' | undefined => {
      const s =
        lc(p?.segment) ||
        lc(p?.category) ||
        lc(p?.segmentType) ||
        lc(p?.propertySegment) ||
        lc(p?.usage);

      if (s.includes('commercial')) return 'commercial';
      if (s.includes('residential')) return 'residential';

      const t = lc(p?.type) || lc(p?.propertyType);
      if (/(office|retail|shop|commercial)/.test(t)) return 'commercial';
      if (t) return 'residential';
      return undefined;
    };

    const numFromAny = (v: any) => {
      if (typeof v === 'number') return v;
      const n = Number(String(v ?? '').replace(/[^0-9.]/g, ''));
      return Number.isFinite(n) ? n : undefined;
    };

    return all.filter((p) => {
      if (q.segment) {
        const seg = mapSegment(p);
        if (seg && seg !== q.segment) return false;
      }

      if (q.forWhat) {
        const raw =
          p?.status ??
          p?.for ??
          p?.listingType ??
          p?.saleType ??
          p?.availability ??
          p?.projectStatus ??
          p?.stage ??
          undefined;

        const st = mapStatus(raw);
        if (st && st !== q.forWhat) return false;
      }

      if (q.location) {
        const needles = lc(q.location);
        const hay =
          lc(p?.location) ||
          lc(p?.locality) ||
          lc(p?.area) ||
          lc(p?.address) ||
          '';
        if (hay && !hay.includes(needles)) return false;
      }

      if (q.min !== undefined || q.max !== undefined) {
        const price = numFromAny(p?.price ?? p?.priceInr ?? p?.amount ?? p?.rate);
        if (price !== undefined) {
          if (q.min !== undefined && price < q.min) return false;
          if (q.max !== undefined && price > q.max) return false;
        }
      }

      if (q.bhk) {
        const bhk = p?.bhk ?? p?.bedrooms;
        if (bhk !== undefined && String(bhk) !== q.bhk) return false;
      }

      if (q.ptype) {
        const pt = lc(p?.type || p?.propertyType);
        if (pt && pt !== lc(q.ptype)) return false;
      }

      return true;
    });
  }, [all, q]);

  const removeParam = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  };
  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-900">Properties</h1>
            <p className="text-gray-600 mt-1">
              Showing <strong>{filtered.length}</strong> of {all.length || 0} results
            </p>
            {sheetItems === null && <p className="text-sm text-gray-500 mt-1">Loading Google Sheet…</p>}
            {sheetError && <p className="text-sm text-red-600 mt-1">Couldn’t load Sheet. Showing fallback data.</p>}
          </div>
          <Link
            to="/"
            className="hidden sm:inline-flex items-center rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Selected filters as chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {q.segment && <Chip label={`Segment: ${capitalize(q.segment)}`} onClear={() => removeParam('segment')} />}
          {q.forWhat && <Chip label={`For: ${prettyFor(q.forWhat)}`} onClear={() => removeParam('for')} />}
          {q.location && <Chip label={`Location: ${q.location}`} onClear={() => removeParam('location')} />}
          {q.min !== undefined || q.max !== undefined ? (
            <Chip
              label={`Budget: ${q.min !== undefined ? '₹' + formatCr(q.min) + 'Cr' : '—'} – ${
                q.max !== undefined ? '₹' + formatCr(q.max) + 'Cr' : '—'
              }`}
              onClear={() => {
                const next = new URLSearchParams(params);
                next.delete('min');
                next.delete('max');
                setParams(next, { replace: true });
              }}
            />
          ) : null}
          {q.bhk && <Chip label={`${q.bhk} BHK`} onClear={() => removeParam('bhk')} />}
          {q.ptype && <Chip label={`${q.ptype}`} onClear={() => removeParam('ptype')} />}
          {params.toString().length > 0 && (
            <button onClick={clearAll} className="ml-2 text-sm text-gray-600 hover:text-brand-600 underline underline-offset-2">
              Clear all
            </button>
          )}
        </div>

        {/* Results grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <article key={p?.id ?? i} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100">
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img
                  src={p?.cover || p?.image || p?.images?.[0] || '/placeholder.jpg'}
                  alt={p?.title || 'Property image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy-900 line-clamp-1">{p?.title || p?.name || 'Property'}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{p?.location || p?.area || p?.address || 'South Mumbai'}</p>
                <div className="mt-2 text-sm text-gray-700">
                  {p?.bhk ? <span className="mr-3">{p.bhk} BHK</span> : null}
                  {p?.type ? <span className="mr-3">{p.type}</span> : null}
                  {p?.segment ? <span className="mr-3 capitalize">{p.segment}</span> : null}
                  {p?.status ? <span className="mr-3 capitalize">{p.status}</span> : null}
                </div>
                <div className="mt-3 font-semibold text-navy-900">
                  {typeof p?.price === 'number' ? `₹ ${formatINR(p.price)}` : p?.price || 'Price on request'}
                </div>
                {p?.id ? (
                  <Link to={`/properties/${p.id}`} className="mt-3 inline-flex text-sm text-brand-600 hover:underline">
                    View details →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-12 text-center text-gray-600">
            No properties match these filters. Try clearing some filters or adjusting your search.
          </div>
        )}
      </div>
    </main>
  );
}
