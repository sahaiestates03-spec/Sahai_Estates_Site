import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSheet, type PropertyRow } from '../data/sheet';
import PropertyCard from '../components/PropertyCard';

function num(v?: string | number) {
  if (v == null) return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

export default function PropertiesPage() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const q_for = (params.get('for') || '').toLowerCase();            // 'resale'|'rent'|'under-construction'
  const q_segment = (params.get('segment') || '').toLowerCase();    // 'residential'|'commercial'
  const q_loc = (params.get('location') || '').toLowerCase();
  const q_min = num(params.get('min') || undefined);
  const q_max = num(params.get('max') || undefined);
  const q_bhk = num(params.get('bhk') || undefined);
  const q_ptype = params.get('ptype') || '';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;
        setRows(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      // for (rent/resale/new)
      if (q_for && (r.listingFor || '').toLowerCase() !== q_for) return false;
      // segment
      if (q_segment && (r.segment || '').toLowerCase() !== q_segment) return false;
      // location contains
      if (q_loc && !(r.location || '').toLowerCase().includes(q_loc)) return false;
      // bedrooms
      if (q_bhk && (!r.bedrooms || r.bedrooms < q_bhk)) return false;
      // property type contains (case-insensitive)
      if (q_ptype && !(r.propertyType || '').toLowerCase().includes(q_ptype.toLowerCase())) return false;

      // budget logic: treat price as rupees always (your sheet parser should already do this)
      const p = r.price ?? 0;
      if (q_min != null && p < q_min) return false;
      if (q_max != null && p > q_max) return false;

      return true;
    });
  }, [rows, q_for, q_segment, q_loc, q_bhk, q_ptype, q_min, q_max]);

  if (loading) {
    return <div className="pt-24 max-w-6xl mx-auto p-6 text-gray-600">Loading…</div>;
  }

  return (
    <div className="pt-24 max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-serif font-bold mb-2">Properties</h1>
      <p className="text-sm text-gray-600 mb-6">
        Showing {filtered.length} of {rows.length} results
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-gray-600">
          No properties match these filters. Try clearing some filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
