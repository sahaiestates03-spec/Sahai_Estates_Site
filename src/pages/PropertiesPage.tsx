import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Data
import * as DATA from '../data/mockData';

// ✅ Use your card component
import PropertyCard from '../components/PropertyCard';

type QFor = 'resale' | 'rent' | 'under-construction';
type QSegment = 'residential' | 'commercial';

function num(v?: string | null) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();

  const q = useMemo(() => {
    const segment = (params.get('segment') as QSegment | null) || undefined;
    const forWhat = (params.get('for') as QFor | null) || undefined;
    const location = params.get('location') || undefined;
    const min = num(params.get('min'));
    const max = num(params.get('max'));
    const bhk = params.get('bhk') || undefined; // "2" | "3" | ...
    const ptype = params.get('ptype') || undefined; // Apartment | Villa | Office...

    return { segment, forWhat, location, min, max, bhk, ptype };
  }, [params]);

  // Pull array from your mock data (try common names)
  const all: any[] =
    (DATA as any).properties ||
    (DATA as any).list ||
    (DATA as any).default ||
    [];

  const filtered = useMemo(() => {
  const mapStatus = (raw?: any) => {
    if (!raw) return undefined;
    const s = String(raw).toLowerCase().trim();
    if (/(buy|sale|sell|for sale|ready to move)/i.test(s)) return 'resale';
    if (/(rent|lease)/i.test(s)) return 'rent';
    if (/(under.?construction|new launch|launch)/i.test(s)) return 'under-construction';
    return s;
  };

  const guessSegment = (p: any) => {
    if (p?.segment) return String(p.segment).toLowerCase();
    // Guess by type – office/retail => commercial, otherwise residential
    const t = String(p?.type ?? '').toLowerCase();
    if (/(office|retail|shop|commercial)/.test(t)) return 'commercial';
    return undefined; // keep undefined so it doesn't block
  };

  return all.filter((p) => {
    // Segment (relaxed includes)
    if (q.segment) {
      const seg = guessSegment(p);
      if (p?.segment || seg) {
        const value = String(p?.segment ?? seg ?? '').toLowerCase();
        if (!value.includes(q.segment)) return false;
      }
    }

    // For (status mapping)
    if (q.forWhat) {
      const raw =
        p?.status ?? p?.for ?? p?.listingType ?? p?.saleType ?? p?.availability ?? undefined;
      const st = mapStatus(raw);
      // Only block if we have a mapped status and it mismatches
      if (st && st !== q.forWhat) return false;
    }

    // Location includes
    if (q.location && p?.location && !String(p.location).toLowerCase().includes(q.location.toLowerCase()))
      return false;

    // Price range
    if ((q.min !== undefined || q.max !== undefined)) {
      const price =
        typeof p?.price === 'number'
          ? p.price
          : Number(String(p?.price ?? '').replace(/[^0-9]/g, '') || NaN);
      if (Number.isFinite(price)) {
        if (q.min !== undefined && price < q.min) return false;
        if (q.max !== undefined && price > q.max) return false;
      }
    }

    // BHK exact when present
    if (q.bhk && (p?.bhk !== undefined && String(p.bhk) !== q.bhk)) return false;

    // Property type exact when present
    if (q.ptype && p?.type && String(p.type).toLowerCase() !== q.ptype.toLowerCase()) return false;

    return true;
  });
}, [all, q]);


  // Helpers to update/remove params
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
          {q.segment && (
            <Chip label={`Segment: ${capitalize(q.segment)}`} onClear={() => removeParam('segment')} />
          )}
          {q.forWhat && (
            <Chip label={`For: ${prettyFor(q.forWhat)}`} onClear={() => removeParam('for')} />
          )}
          {q.location && (
            <Chip label={`Location: ${q.location}`} onClear={() => removeParam('location')} />
          )}
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

          {/* Clear all */}
          {(params.toString().length > 0) && (
            <button
              onClick={clearAll}
              className="ml-2 text-sm text-gray-600 hover:text-brand-600 underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results grid -> use PropertyCard */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <PropertyCard key={p?.id ?? i} property={p} />
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

/* ---------------- helpers ---------------- */

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

// Convert rupees to crore with 2 decimals
function formatCr(n: number) {
  return (n / 1e7).toFixed(2);
}
