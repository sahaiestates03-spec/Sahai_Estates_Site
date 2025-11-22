// src/components/FeaturedNewLaunch.tsx

// helper to build a consistent "property" state object passed to Link
const makePropertyState = (p: any) => {
  const slug = (p.slug || sluggify(p.project_name || p.title || p.project_id || "")).toString().trim().toLowerCase();
  return {
    id: p.project_id || slug,
    slug,
    title: p.project_name || p.title || slug,
    location: `${p.locality || ""}${p.locality ? ", " : ""}${p.city || ""}`.replace(/^,|,$/g, ""),
    price: Number(p.price_min_inr || p.price || 0) || 0,
    listingFor: "under-construction",
    description: p.description || `${p.developer_name || ""} new launch in ${p.locality || p.city || "Mumbai"}.`,
    images: p.gallery_image_urls || p.images || `FOLDER::new-launch/${slug}/*`,
    brochure_url: p.brochure_url || ""
  };
};

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNewLaunch, type Project } from "../data/newLaunch";

const sluggify = (s?: string) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function rupee(n?: string) {
  if (!n) return "";
  const x = Number(n);
  if (!x) return "";
  if (x >= 1e7) return `₹${(x / 1e7).toFixed(2)} Cr`;
  if (x >= 1e5) return `₹${(x / 1e5).toFixed(2)} L`;
  return `₹${x.toLocaleString("en-IN")}`;
}

export default function FeaturedNewLaunch() {
  const [items, setItems] = useState<Project[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const rows = await fetchNewLaunch();
      // Strict filter: only rows that have featured = TRUE (case-insensitive)
      console.log("fetchNewLaunch rows:", rows);
      const featuredOnly = (rows || []).filter(
        (r) => String((r as any).featured || "").toLowerCase() === "true"
      );
      setItems(featuredOnly);
    })();
  }, []);

  const canScroll = useMemo(() => (items?.length || 0) > 0, [items]);

  const scrollByCard = (dir: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    rail.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="featured-new-launches relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-12">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Featured New Launches
        </h2>
        {canScroll && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollByCard("left")}
              className="h-10 w-10 rounded-xl border hover:bg-gray-50 flex items-center justify-center"
              aria-label="Previous"
              title="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => scrollByCard("right")}
              className="h-10 w-10 rounded-xl border hover:bg-gray-50 flex items-center justify-center"
              aria-label="Next"
              title="Next"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
      >
        {items.map((p) => {
          // build consistent state object for every link
          const stateObj = makePropertyState(p);
          const slug = stateObj.slug;
          // price label: show range if min/max present else price on request
          const priceLabel =
            (p.price_min_inr && p.price_max_inr)
              ? `${rupee(p.price_min_inr)} – ${rupee(p.price_max_inr)}`
              : (stateObj.price && stateObj.price > 0 ? rupee(String(stateObj.price)) : "Price on request");

          return (
            <div
              key={slug}
              data-card
              className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] snap-start rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border bg-white"
            >
              {/* Card link: passes the same stateObj */}
              <Link
                to={`/properties/${slug}`}
                state={{ property: stateObj }}
                className="block"
              >
                <img
                  src={p.hero_image_url || stateObj.images || "/fallbacks/project-hero.jpg"}
                  alt={stateObj.title}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/fallbacks/project-hero.jpg";
                  }}
                />
              </Link>

              <div className="p-4">
                <div className="text-base font-semibold line-clamp-1">{stateObj.title}</div>
                <div className="text-sm text-gray-600 line-clamp-1">
                  {stateObj.location}
                </div>
                <div className="text-sm mt-1 line-clamp-1">{p.unit_types}</div>
                <div className="text-sm mt-1">{priceLabel}</div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/properties/${slug}`}
                    state={{ property: stateObj }}
                    className="px-3 py-2 rounded-xl border"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/properties/${slug}#brochure`}
                    state={{ property: stateObj }}
                    className="px-3 py-2 rounded-xl bg-black text-white"
                  >
                    Get Brochure
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
