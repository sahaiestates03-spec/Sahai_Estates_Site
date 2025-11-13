import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import PropertyCard from "./PropertyCard";

function parseBool(v: unknown) {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return ["true", "yes", "1", "y"].includes(s);
}

// If PropertyCard expects a different shape than PropertyRow,
// adapt it here. For now we pass through as-is.
function getStableKey(r: PropertyRow, idx: number) {
  return (r as any).slug || (r as any).id || `${idx}`;
}

export default function FeaturedProperties() {
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return () => {
      alive = false;
    };
  }, []);

  const featured = useMemo(() => {
    // Filter by sheet column "isFeatured" (TRUE/Yes/1 etc.)
    const flagged = rows.filter(r => parseBool((r as any).isFeatured ?? (r as any).featured));
    const list = flagged.length ? flagged : rows; // fallback if none flagged
    return list.slice(0, 6);
  }, [rows]);

  return (
    <section className="pt-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center">
          Featured <span className="text-brand-600">Properties</span>
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Handpicked selection of our most exclusive luxury properties in South Mumbai
        </p>

        {/* States */}
        {loading && (
          <div className="mt-10 text-center text-gray-600">
            Loading featured properties…
          </div>
        )}

        {error && (
          <div className="mt-10 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <div className="font-semibold mb-1">Could not load featured properties</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {featured.length ? (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((p, idx) => (
                  <div key={getStableKey(p, idx)}>
                    {/* If needed, map p to the exact shape PropertyCard expects */}
                    <PropertyCard property={p as any} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-10 text-center text-gray-600">
                No featured properties found. Mark some rows as{" "}
                <code>isFeatured = TRUE</code> in your sheet.
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                to="/properties"
                className="inline-flex items-center px-5 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-brand-600"
              >
                View All Properties
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
