// src/pages/PropertyDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import BrochureLeadBox from "../components/BrochureLeadBox";
import { fetchNewLaunch } from "../data/newLaunch";

import {
  MapPin, Bed, Bath, Square, Phone, MessageCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";

/* ---------- helpers ---------- */
const sluggify = (s?: string | null) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const same = (a?: string | null, b?: string | null) =>
  (a || "").toLowerCase() === (b || "").toLowerCase();

function inr(n: number) { return n.toLocaleString("en-IN"); }

function priceLabel(price?: number, listingFor?: "resale"|"rent"|"under-construction") {
  if (!price || price <= 0) return listingFor === "rent" ? "₹ — / month" : "Price on request";
  if (listingFor === "rent") {
    if (price >= 100000) {
      var lvalue = price / 100000;
      var decimals = lvalue >= 10 ? 1 : 2;
      return String(lvalue.toFixed(decimals)) + " L / month";
    }
    return "₹" + inr(price) + " / month";
  }
  if (price >= 10000000) return "₹" + String((price / 10000000).toFixed(2)) + " Cr";
  if (price >= 100000) return "₹" + String((price / 100000).toFixed(2)) + " L";
  return "₹" + inr(price);
}

/** Build image candidates (no template literals) */
function buildImageCandidates(p: PropertyRow): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    const s = String(u).trim();
    if (!s) return;
    const final = (s.indexOf("http") === 0 || s.indexOf("/") === 0) ? s : "/prop-pics/" + s.replace(/^\/+/, "");
    if (out.indexOf(final) === -1) out.push(final);
  };

  const raw: any = (p as any).images || (p as any).gallery_image_urls || (p as any).gallery;
  const seg = (p as any).segment ? String((p as any).segment).toLowerCase() : "";
  const slug = (p as any).slug ? String((p as any).slug).toLowerCase() : sluggify((p as any).id || (p as any).title);
  const folderGuesses: string[] = [];
  if (seg && slug) folderGuesses.push(seg + "/" + slug);
  if (slug) folderGuesses.push(slug);

  if (Array.isArray(raw)) {
    raw.forEach((r) => push(String(r || "")));
  }

  if (typeof raw === "string") {
    const text = raw.trim();
    const separators = /[,\|;]+/;
    if (text.toUpperCase().indexOf("FOLDER::") === 0) {
      let folder = text.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"").replace(/^\/+/, "");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (/(.+\/.+)(\*|$)/.test(text) && !/\.[a-z0-9]+$/i.test(text)) {
      let folder = text.replace(/\/?\*$/,"").replace(/^\/+/,"");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (separators.test(text)) {
      text.split(separators).map(s => s.trim()).forEach((x) => push(x));
    } else if (text) {
      push(text);
    }
  }

  folderGuesses.forEach((folder) => {
    for (let i = 1; i <= 20; i++) {
      ["jpg","jpeg","png","webp"].forEach(ext => push("/prop-pics/" + folder + "/" + i + "." + ext));
    }
  });

  folderGuesses.forEach((folder) => {
    ["jpg","jpeg","png","webp"].forEach(ext => push("/prop-pics/" + folder + "." + ext));
  });

  return out;
}

/** Preload images (unchanged) */
async function preloadImages(urls: string[]): Promise<string[]> {
  const checks = urls.map(
    (u) =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(u);
        img.onerror = () => resolve(null);
        img.src = u;
      })
  );
  const results = await Promise.all(checks);
  return results.filter((u): u is string => Boolean(u));
}

/* ---------- component ---------- */
export default function PropertyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const key = sluggify(String(slug || ""));
  const location = useLocation() as { state?: { property?: PropertyRow } };

  const propFromState = location?.state?.property ?? null;

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!propFromState);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;

        try {
          const nl = await fetchNewLaunch();
          const mapped = nl.map((p: any) => {
            const slugValue = (p.slug || sluggify(p.project_name || p.project_id || "")).toString().trim().toLowerCase();

            // Parse carpet area range (from provided columns carpet_min_sqft / carpet_max_sqft)
            let carpetArea = undefined;
            if (p.carpet_min_sqft || p.carpet_max_sqft) {
              const min = p.carpet_min_sqft ? String(p.carpet_min_sqft).trim() : "";
              const max = p.carpet_max_sqft ? String(p.carpet_max_sqft).trim() : "";
              if (min && max) {
                carpetArea = min + " - " + max + " sqft";
              } else if (min) {
                carpetArea = min + "+ sqft";
              } else if (max) {
                carpetArea = "Up to " + max + " sqft";
              }
            }

            return {
              id: p.project_id || slugValue,
              slug: slugValue,
              title: p.project_name || p.title || slugValue,
              project_name: p.project_name || undefined,
              developer_name: p.developer_name || undefined,
              location: (p.locality || "") + (p.locality ? ", " : "") + (p.city || ""),
              city: p.city || undefined,
              locality: p.locality || undefined,
              price: p.price_min_inr ? Number(p.price_min_inr) : p.price ? Number(p.price) : 0,
              price_min_inr: p.price_min_inr ? Number(p.price_min_inr) : undefined,
              price_max_inr: p.price_max_inr ? Number(p.price_max_inr) : undefined,
              all_inclusive_price: p.all_inclusive_price || undefined,
              price_note: p.price_note || undefined,
              listingFor: "under-construction" as const,
              for: "under-construction",
              segment: (p.segment || "residential").toString().toLowerCase(),
              status: p.status || undefined,
              description: p.description || ( (p.developer_name || "") + " new launch in " + (p.locality || p.city || "Mumbai") + "." ),
              images: p.gallery_image_urls || p.gallery || "FOLDER::" + slugValue + "/*",
              brochure_url: p.brochure_url || "",
              youtube_video_url: p.youtube_video_url || undefined,
              virtual_tour_url: p.virtual_tour_url || undefined,
              floor_plan_urls: p.floor_plan_urls || undefined,
              site_plan_url: p.site_plan_url || undefined,
              price_list_url: p.price_list_url || undefined,
              rera_id: p.rera_id || undefined,
              rera_url: p.rera_url || undefined,
              launch_date: p.launch_date || undefined,
              possession_quarter: p.possession_quarter || undefined,
              possession_year: p.possession_year || undefined,
              construction_stage: p.construction_stage || undefined,
              unit_types: p.unit_types || undefined,
              beds_options: p.beds_options || undefined,
              carpet_min_sqft: p.carpet_min_sqft || undefined,
              carpet_max_sqft: p.carpet_max_sqft || undefined,
              maintenance_psf: p.maintenance_psf || undefined,
              gst_percent: p.gst_percent || undefined,
              stamp_duty_percent: p.stamp_duty_percent || undefined,
              registration_fees: p.registration_fees || undefined,
              total_acres: p.total_acres || undefined,
              num_towers: p.num_towers || undefined,
              floors_per_tower: p.floors_per_tower || undefined,
              units_total: p.units_total || undefined,
              elevation_style: p.elevation_style || undefined,
              architect: p.architect || undefined,
              contractor: p.contractor || undefined,
              amenities_primary: p.amenities_primary || undefined,
              amenities_sports: p.amenities_sports || undefined,
              amenities_safety: p.amenities_safety || undefined,
              amenities_green: p.amenities_green || undefined,
              parking_type: p.parking_type || undefined,
              parking_ratio: p.parking_ratio || undefined,
              water_supply: p.water_supply || undefined,
              power_backup: p.power_backup || undefined,
              fire_safety: p.fire_safety || undefined,
              hero_image_url: p.hero_image_url || undefined,
              gallery_image_urls: p.gallery_image_urls || undefined,
              sales_person_name: p.sales_person_name || undefined,
              sales_phone: p.sales_phone || undefined,
              sales_email: p.sales_email || undefined,
              meta_title: p.meta_title || undefined,
              meta_description: p.meta_description || undefined,
              canonical_url: p.canonical_url || undefined,
              featured: p.featured || undefined,
              priority_rank: p.priority_rank || undefined,
              notes: p.notes || undefined,
              bedrooms: p.beds_option || p.bedrooms || undefined,
              propertyType: p.unit_types || undefined,
              areaSqft: carpetArea || undefined,
            } as PropertyRow;
          }) as PropertyRow[];
          if (alive) setRows((data || []).concat(mapped));
        } catch (err) {
          if (alive) setRows(data);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const propFromSheet = useMemo(() => {
    if (!rows.length || !key) return null;
    return (
      rows.find(r => same(sluggify(r.slug as any), key) || same(r.slug as any, key)) ||
      rows.find(r => same(sluggify(r.id as any), key) || same(String(r.id || ""), slug)) ||
      rows.find(r => same(sluggify(r.title as any), key)) ||
      null
    );
  }, [rows, key, slug]);

  const property = propFromState || propFromSheet || null;

  const [images, setImages] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!property) return;
      setImgLoading(true);
      const candidates = buildImageCandidates(property);
      const valid = await preloadImages(candidates);
      if (!alive) return;
      setImages(valid);
      setImgLoading(false);
    })();
    return () => { alive = false; };
  }, [property]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) {
      setIndex(0);
      return;
    }
    if (index >= images.length) setIndex(0);
  }, [images, index]);

  const [fit, setFit] = useState<"contain"|"cover">("contain");
  const prev = () => setIndex(i => (images.length ? (i - 1 + images.length) % images.length : 0));
  const next = () => setIndex(i => (images.length ? (i + 1) % images.length : 0));
  const goto = (i: number) => setIndex(i);

  // UPDATED: use 9920214015 as requested (international prefix for links)
  const waNumber = "919920214015"; // +91 9920214015
  const salesPhoneFallback = "9920214015";

  const waText = property ? "Hi, I'm interested in " + (property.title || property.project_name) + " (" + priceLabel(property.price, property.listingFor) + "). Please share details." : "";
  const waLink = property ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(waText) : "https://wa.me/" + waNumber;
  const telLink = "tel:+91" + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback);

  // Utilities: copy JSON, download JSON (buttons removed from UI per request)
  const copyJson = async () => {
    if (!property) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(property, null, 2));
      alert("Property JSON copied to clipboard");
    } catch (e) {
      alert("Copy failed. You can download the JSON instead.");
    }
  };

  const downloadJson = () => {
    if (!property) return;

    const rawName = property.title || property.project_name || property.id || "property";
    const base = String(rawName).replace(/\s+/g, "_").replace(/[^\w\-\.]/g, "");
    const filename = base + ".json";

    const blob = new Blob([JSON.stringify(property, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!property && loading) {
    return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/properties" className="hover:underline">Properties</Link> /{" "}
          <span>Not found</span>
        </nav>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link to="/properties" className="inline-block mt-6 px-5 py-3 bg-black text-white rounded-lg">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">Properties</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{property.title || property.project_name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{property.title || property.project_name}</h1>
            {property.location ? (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin size={18} /> {property.location}
              </p>
            ) : null}
          </div>

          {/* Header buttons (Call shows only 'Call' visually) */}
          <div className="flex items-center gap-3">
            <span className="inline-block bg-black text-white px-4 py-2 rounded-lg font-semibold">
              {priceLabel(property.price, property.listingFor)}
            </span>

            <a href={waLink} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow">
              <MessageCircle size={18} /> Enquire on WhatsApp
            </a>

            <a
              href={telLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              aria-label={"Call " + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback)}
              title={"Call " + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback)}
            >
              <Phone size={16} /> <span>Call</span>
              <span className="sr-only">
                {(property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback}
              </span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery / Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-white rounded-lg shadow overflow-hidden">
              {imgLoading ? (
                <div className="h-72 flex items-center justify-center text-gray-400">Loading images…</div>
              ) : images.length ? (
                <div className="relative">
                  <div className="h-96 flex items-center justify-center bg-gray-100">
                    <img
                      src={images[index]}
                      alt={(property.title || "Property") + " - " + (index + 1)}
                      className="max-h-96 w-full"
                      style={{ objectFit: fit }}
                    />
                  </div>

                  {/* Prev / Next */}
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                    <ChevronRight size={20} />
                  </button>

                  {/* Fit toggle */}
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button onClick={() => setFit("contain")} className={fit === "contain" ? "px-2 py-1 rounded bg-black text-white" : "px-2 py-1 rounded bg-white"}>Contain</button>
                    <button onClick={() => setFit("cover")} className={fit === "cover" ? "px-2 py-1 rounded bg-black text-white" : "px-2 py-1 rounded bg-white"}>Cover</button>
                  </div>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">No images available</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((u, i) => (
                  <button key={u} onClick={() => goto(i)} className={i === index ? "flex-shrink-0 w-28 h-20 rounded overflow-hidden border ring-2 ring-black" : "flex-shrink-0 w-28 h-20 rounded overflow-hidden border border-gray-200"}>
                    <img src={u} alt={"thumb-" + i} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {property.description || property.overview || "No description available."}
              </p>

              {/* Video / Virtual tour quick links */}
              <div className="mt-4 flex gap-3">
                {property.youtube_video_url ? (
                  <a href={String(property.youtube_video_url)} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Watch Video</a>
                ) : null}
                {property.virtual_tour_url ? (
                  <a href={String(property.virtual_tour_url)} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Virtual Tour</a>
                ) : null}
                {property.brochure_url ? (
                  <a href={String(property.brochure_url)} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Download Brochure</a>
                ) : null}
              </div>
            </div>

            {/* Features / Specs */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Bed size={18} /> <div>
                    <div className="text-sm">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms || property.beds_options || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={18} /> <div>
                    <div className="text-sm">Bathrooms</div>
                    <div className="font-medium">{(property as any).bathrooms || (property as any).baths || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square size={18} /> <div>
                    <div className="text-sm">Area</div>
                    <div className="font-medium">{property.areaSqft || property.carpet_min_sqft || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} /> <div>
                    <div className="text-sm">Location</div>
                    <div className="font-medium">{property.location || property.locality || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Contact / Brochure / Agent (sheet buttons removed) */}
          <aside className="space-y-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Listing</div>
                    <div className="font-semibold">{(property.listingFor || property.for) || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-semibold">{priceLabel(property.price, property.listingFor)}</div>
                  </div>
                </div>

                {/* Full-width contact buttons */}
                <div className="flex flex-col gap-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:shadow"
                    aria-label={"Message on WhatsApp for " + (property.title || property.project_name || "")}
                  >
                    <MessageCircle size={18} /> <span>Message on WhatsApp</span>
                  </a>

                  <a
                    href={telLink}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg"
                    aria-label={"Call " + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback)}
                    title={"Call " + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback)}
                  >
                    <Phone size={18} /> <span>Call</span>
                    <span className="sr-only">
                      {(property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback}
                    </span>
                  </a>
                </div>

                {/* Brochure / Lead box */}
                <div className="mt-2">
                  <BrochureLeadBox project={{
                    project_id: property.id as any,
                    project_name: property.title || property.project_name,
                    slug: property.slug as any,
                    brochure_url: property.brochure_url || ""
                  }} />
                </div>
              </div>

              {/* Additional info card */}
              <div className="bg-white rounded-lg shadow p-5 mt-4 text-sm text-gray-700">
                <div className="font-semibold mb-2">Developer</div>
                <div>{(property as any).developer_name || "—"}</div>

                {property.possession_year || (property as any).possession_date ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Possession</div>
                    <div className="font-medium">{property.possession_year || (property as any).possession_date}</div>
                  </div>
                ) : null}

                {property.rera_id || property.rera_url ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">RERA</div>
                    <div className="font-medium">
                      {property.rera_id ? property.rera_id : ""}
                      {property.rera_url ? (
                        <a href={String(property.rera_url)} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 underline">View</a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer quick links */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">Interested?</div>
              <div className="text-lg font-semibold">{property.title || property.project_name}</div>
            </div>
            <div className="flex gap-3">
              <a href={waLink} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
              <a href={telLink} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                <Phone size={16} /> Call
              </a>
              <Link to="/properties" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
                Back to listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
