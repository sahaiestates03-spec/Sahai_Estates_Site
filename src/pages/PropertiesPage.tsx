import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchSheet, type PropertyRow } from '../data/sheet';

type QFor = 'resale' | 'rent' | 'under-construction';
type QSegment = 'residential' | 'commercial';

function formatCrore(n: number) {
  // 1 Cr = 1e7
  const cr = n / 1e7;
  return `${cr.toFixed(2)} Cr`;
}

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchSheet();
        setRows(r);
        setError(null);
      } catch (e) {
        console.warn(e);
        setError('Couldn’t load Sheet. Showing fallback data.');
        setRows([]);
      }
    })();
  }, []);

  const q = useMemo(() => {
    const segment = (params.get('segment') as QSegment | null) || undefined;
    const forWhat = (params.get('for') as QFor | null) || undefined;
    const location = params.get('location') || undefined;
    const min = params.get('min') ? Number(params.get('min')) : undefined;
    const max = params.get('max') ? Number(params.get('max')) : undefined;
    const bhk = params.get('bhk') || undefined;
    const ptype = params.get('ptype') || undefined;
    return { segment, forWhat, location, min, max, bhk, ptype };
  }, [params]);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      if (q.segment && p.segment !== q.segment) return false;
      if (q.forWhat && p.listingFor !== q.forWhat) return false;
      if (q.location && p.location && !p.location.toLowerCase().includes(q.location.toLowerCase()))
        return false;
      if ((q.min !== undefined || q.max !== undefined) && typeof p.price === 'number') {
        if (q.min !== undefined && p.price < q.min) return false;
        if (q.max !== undefined && p.price > q.max) return false;
      }
      if (q.bhk && p.bedrooms && String(p.bedrooms) !== q.bhk) return false;
      if (q.ptype && p.propertyType && p.propertyType !== q.ptype) return false;
      return true;
    });
  }, [rows, q]);

  const clearParam = (key: string) => {
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-900">Properties</h1>
            <p className="text-gray-600 mt-1">Showing <strong>{filtered.length}</strong> of {rows.length}</p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <Link to="/" className="hidden sm:inline-flex items-center rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">← Back to Home</Link>
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {q.segment && <Chip label={`Segment: ${cap(q.segment)}`} onClear={() => clearParam('segment')} />}
          {q.forWhat && <Chip label={`For: ${prettyFor(q.forWhat)}`} onClear={() => clearParam('for')} />}
          {q.location && <Chip label={`Location: ${q.location}`} onClear={() => clearParam('location')} />}
          {(q.min !== undefined || q.max !== undefined) && (
            <Chip
              label={`Budget: ${q.min !== undefined ? '₹ ' + formatCrore(q.min) : '—'} – ${q.max !== undefined ? '₹ ' + formatCrore(q.max) : '—'}`}
              onClear={() => {
                const next = new URLSearchParams(params);
                next.delete('min'); next.delete('max');
                setParams(next, { replace: true });
              }}
            />
          )}
          {q.bhk && <Chip label={`${q.bhk} BHK`} onClear={() => clearParam('bhk')} />}
          {q.ptype && <Chip label={`${q.ptype}`} onClear={() => clearParam('ptype')} />}
          {params.toString() && (
            <button onClick={clearAll} className="ml-2 text-sm text-gray-600 hover:text-brand-600 underline underline-offset-2">Clear all</button>
          )}
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const cover =
              p.images?.[0] ||
              '/placeholder.jpg';

            return (
              <article key={p.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100">
                  <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-navy-900 line-clamp-1">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {p.areaLocality || p.location || 'South Mumbai'}
                  </p>
                  <div className="mt-2 text-sm text-gray-700">
                    {p.bedrooms ? <span className="mr-3">{p.bedrooms} BHK</span> : null}
                    {p.bathrooms ? <span className="mr-3">{p.bathrooms} Bath</span> : null}
                    {p.areaSqft ? <span className="mr-3">{p.areaSqft} sq ft</span> : null}
                  </div>
                  <div className="mt-3 font-semibold text-navy-900">
                    {typeof p.price === 'number' ? <>₹ {formatCrore(p.price)}</> : 'Price on request'}
                  </div>
                  {p.id && (
                    <Link to={`/properties/${p.id}`} className="mt-3 inline-flex text-sm text-brand-600 hover:underline">
                      View details →
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center text-gray-600">
            No properties match these filters. Try clearing some filters or adjusting your search.
          </div>
        )}
      </div>
    </main>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-sm text-gray-800">
      {label}
      <button onClick={onClear} className="text-gray-400 hover:text-gray-600" aria-label="Clear filter">×</button>
    </span>
  );
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function prettyFor(f: QFor) {
  if (f === 'resale') return 'Buy';
  if (f === 'rent') return 'Rent';
  return 'Under Construction';
}
