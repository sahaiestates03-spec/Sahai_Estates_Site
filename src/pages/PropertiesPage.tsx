// src/pages/PropertiesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import { properties as mock } from "../data/mockData";

/* ---------------- Price shown on the cards ---------------- */

function inr(n: number) {
  return n.toLocaleString("en-IN");
}

/** Uniform price for list cards – handles rent vs sale nicely */
function priceForCard(price?: number, listingFor?: string) {
  if (!price || price <= 0) return "Price on request";

  const f = (listingFor || "").toLowerCase();

  // RENT: monthly + lakhs if >= 1L
  if (f === "rent" || f === "lease") {
    if (price >= 1e5) {
      const lakhs = price / 1e5;
      const digits = lakhs >= 10 ? 1 : 2;
      return `${lakhs.toFixed(digits)} L / month`;
    }
    return `₹${inr(price)} / month`;
  }

  // SALE: Cr / L / ₹
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} L`;
  return `₹${inr(price)}`;
}

/* ---------------- Page ---------------- */

export default function PropertiesPage() {
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const segParam = (params.get("segment") || "").toLowerCase(); // residential | commercial
  const forParam = (params.get("for") || "").toLowerCase();      // resale | rent | under-construction

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;
        setRows(data.length ? data : (mock as PropertyRow[]));
      } catch {
        setRows(mock as PropertyRow[]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const list = useMemo(() => {
    let out = rows.slice();

    // Apply segment filter from URL (if any)
    if (segParam === "residential" || segParam === "commercial") {
      out = out.filter(
        (p) => (p.segment || "").toLowerCase() === segParam
      );
    }

    // Apply listingFor filter from URL (if any)
    if (
      forParam === "resale" ||
      forParam === "rent" ||
      forParam === "under-construction"
    ) {
      out = out.filter(
        (p) => (p.listingFor || "").toLowerCase() === forParam
      );
    }

    // Light sort: featured first, then most expensive
    out.sort((a, b) => {
      const fa = a.isFeatured ? 1 : 0;
      const fb = b.isFeatured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return (b.price || 0) - (a.price || 0);
    });

    return out;
  }, [rows, segParam, forParam]);

  if (loading) {
    return (
      <div className="pt-24 max-w-6xl mx-auto p-6 text-gray-500">
        Loading properties…
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold">Properties</h1>
        <p className="text-sm text-gray-500">
          Showing {list.length} of {rows.length} results
        </p>
      </header>

      {list.length === 0 ? (
        <div className="text-gray-600">
          No properties match these filters. Try clearing some filters or
          adjusting your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => {
            const img =
              (p.images && p.images.length && p.images[0]) ||
              "/prop-pics/00"; // safe fallback
            const priceText = priceForCard(p.price, p.listingFor);

            return (
              <article
                key={p.id}
                className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Image */}
                <Link to={`/properties/${p.id}`}>
                  <div className="aspect-[4/3] bg-gray-100">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Body */}
                <div className="p-4">
                  <Link
                    to={`/properties/${p.id}`}
                    className="block font-medium hover:text-brand-600"
                  >
                    {p.title}
                  </Link>

                  <div className="mt-1 text-xs text-gray-500">
                    {p.location || p.areaLocality || ""}
                  </div>

                  {/* Meta */}
                  <div className="mt-2 text-[13px] text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                    {p.bedrooms ? <span>{p.bedrooms} BHK</span> : null}
                    {p.bathrooms ? <span>{p.bathrooms} Bath</span> : null}
                    {p.areaSqft ? <span>{p.areaSqft} sq ft</span> : null}
                  </div>

                  {/* Price */}
                  <div className="mt-2 font-semibold">{priceText}</div>

                  <Link
                    to={`/properties/${p.id}`}
                    className="inline-block mt-2 text-sm text-brand-600 hover:text-brand-700"
                  >
                    View details →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
