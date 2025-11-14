// src/pages/PropertiesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import PropertyCard from "../components/PropertyCard";

/** safe numeric parse for price strings */
function parsePriceValue(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).trim();
  if (!s) return undefined;
  // handle "12.5 Cr", "₹ 1,23,45,678", "1,23,45,678", "250 / month"
  if (s.match(/cr/i)) {
    const m = s.match(/[\d.,]+/);
    if (m) {
      const n = Number(m[0].replace(/,/g, ""));
      if (!Number.isFinite(n)) return undefined;
      return Math.round(n * 10000000);
    }
  }
  if (s.match(/lakh|lac/i)) {
    const m = s.match(/[\d.,]+/);
    if (m) {
      const n = Number(m[0].replace(/,/g, ""));
      if (!Number.isFinite(n)) return undefined;
      return Math.round(n * 100000);
    }
  }
  // plain digits
  const digits = s.replace(/[^\d.]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

/** helper: first non-empty from many possible fields */
function pickField(r: any, ...keys: string[]) {
  for (const k of keys) {
    const val = r?.[k];
    if (val !== undefined && val !== null && String(val).trim() !== "") return val;
  }
  return undefined;
}

/** numeric parse helper for bhk/bedrooms */
function parseBhk(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return Math.round(v);
  const s = String(v).trim().toLowerCase();
  const m = s.match(/\d+/);
  if (m) return Number(m[0]);
  return undefined;
}

/** parse query param number-ish */
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

  // query filters
  const q_for = (params.get("for") || "").toLowerCase();         // 'resale' | 'rent' | 'under-construction'
  const q_segment = (params.get("segment") || "").toLowerCase(); // 'residential' | 'commercial'
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
    if (!rows || !rows.length) return [];

    return rows.filter((rRaw) => {
      // create a normalized accessor object to cover multiple header names
      const r: Record<string, any> = rRaw as any;

      // listingFor can be under many names: listingFor, status, for, saleType, listing_type
      const listingForRaw = pickField(r, "listingFor", "listingfor", "status", "for", "saleType", "listing_type", "listingtype");
      const listingFor = listingForRaw ? String(listingForRaw).toLowerCase() : "";

      // segment may be named segment, type, category
      const segmentRaw = pickField(r, "segment", "type", "propertyType", "property_type");
      const segment = segmentRaw ? String(segmentRaw).toLowerCase() : "";

      // location can be location, locality, area, city, address
      const locRaw = pickField(r, "location", "locality", "area", "city", "address", "areaLocality");
      const locVal = locRaw ? String(locRaw).toLowerCase() : "";

      // bedrooms / bhk: many names
      const bhkRaw = pickField(r, "bedrooms", "beds", "bhk", "beds_options", "bedsoptions");
      const bhkVal = parseBhk(bhkRaw);

      // propertyType / ptype
      const ptypeRaw = pickField(r, "propertyType", "property_type", "unit_types", "unit_types");
      const ptypeVal = ptypeRaw ? String(ptypeRaw).toLowerCase() : "";

      // price: check many columns
      const priceRaw = pickField(r, "price", "price_min_inr", "price_min", "all_inclusive_price", "price_min_inr");
      const priceNum = parsePriceValue(priceRaw);

      // ---- apply filters ----
      // q_for (exact match)
      if (q_for) {
        if (!listingFor || listingFor.indexOf(q_for) === -1) return false;
      }

      // q_segment (exact match)
      if (q_segment) {
        if (!segment || segment.indexOf(q_segment) === -1) return false;
      }

      // q_loc contains
      if (q_loc) {
        if (!locVal || locVal.indexOf(q_loc) === -1) return false;
      }

      // q_bhk minimum
      if (q_bhk != null) {
        if (bhkVal == null || bhkVal < q_bhk) return false;
      }

      // ptype contains
      if (q_ptype) {
        if (!ptypeVal || ptypeVal.indexOf(q_ptype) === -1) return false;
      }

      // price range
      if (q_min != null) {
        if (priceNum == null || priceNum < q_min) return false;
      }
      if (q_max != null) {
        if (priceNum == null || priceNum > q_max) return false;
      }

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
