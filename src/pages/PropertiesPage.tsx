import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import PropertyCard from "../components/PropertyCard";

/** parse number safely from query string */
function num(v?: string | null) {
  if (!v) return undefined;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export default function PropertiesPage() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // read filters from query
  const q_for = (params.get("for") || "").toLowerCase();            // 'resale' | 'rent' | 'under-construction'
  const q_segment = (params.get("segment") || "").toLowerCase();    // 'residential' | 'commercial'
  const q_loc = (params.get("location") || "").toLowerCase();
  const q_min = num(params.get("min"));
  const q_max = num(params.get("max"));
  const q_bhk = num(params.get("bhk"));
  const q_ptype = (params.get("ptype") || "").toLowerCase();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load properties.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      // for (rent/resale/new)
      const forVal = (r as any).listingFor ? String((r as any).listingFor).toLowerCase() : "";
      if (q_for && forVal !== q_for) return false;

      // segment
      const segVal = (r as any).segment ? String((r as any).segment).toLowerCase() : "";
      if (q_segment && segVal !== q_segment) return false;

      // location contains
      const locVal = (r as any).location ? String((r as any).location).toLowerCase() : "";
      if (q_loc && !locVal.includes(q_loc)) return false;

      // bedrooms (minimum)
      const bhkVal = (r as any).bedrooms ?? (r as any).bhk;
      if (q_bhk && !(typeof bhkVal === "number" && bhkVal >= q_bhk)) return false;

      // property type contains
      const ptypeVal = (r as any).propertyType ? String((r as any).propertyType).toLowerCase() : "";
      if (q_ptype && !ptypeVal.includes(q_ptype)) return false;

      // price range (assumes price is rupees number or numeric string)
      const priceRaw = (r as any).price;
      const priceNum = typeof priceRaw === "number"
        ? priceRaw
        : Number(String(priceRaw ?? "").replace(/[^\d]/g, ""));
      if (q_min != null && (!Number.isFinite(priceNum) || priceNum < q_min)) return false;
      if (q_max != null && (!Number.isFinite(priceNum) || priceNum > q_max)) return false;

      return true;
    });
  }, [rows, q_for, q_segment, q_loc, q_bhk, q_ptype, q_min, q_max]);

  if (loading) {
    return (
      <div className="pt-24 max-w-6xl mx-auto p-6 text-gray-600">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 max-w-6xl mx-auto p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-6xl mx-auto p-6">
      {/* Filters summary */}
      <div className="mb-4 text-sm text-gray-600 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-gray-100 rounded">for: {q_for || "any"}</span>
        <span className="px-2 py-1 bg-gray-100 rounded">segment: {q_segment || "any"}</span>
        {q_loc ? <span className="px-2 py-1 bg-gray-100 rounded">location: {q_loc}</span> : null}
        {q_bhk ? <span className="px-2 py-1 bg-gray-100 rounded">min bhk: {q_bhk}</span> : null}
        {(q_min ?? null) !== null ? <span className="px-2 py-1 bg-gray-100 rounded">min: ₹{q_min}</span> : null}
        {(q_max ?? null) !== null ? <span className="px-2 py-1 bg-gray-100 rounded">max: ₹{q_max}</span> : null}
        {q_ptype ? <span className="px-2 py-1 bg-gray-100 rounded">type: {q_ptype}</span> : null}
      </div>

      <h1 className="text-2xl font-serif font-bold mb-2">Properties</h1>
      <p className="text-sm text-gray-600 mb-6">
        Showing {filtered.length} of {rows.length} results
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-gray-600">
          No properties match these filters.&nbsp;
          <a href="#/properties" className="text-blue-600 underline">Clear filters</a>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={(p as any).slug || (p as any).id || Math.random()} property={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
