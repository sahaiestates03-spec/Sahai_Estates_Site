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
    if (price >= 1e5) return `${(price / 1e5).toFixed(price/1e5 >= 10 ? 1 : 2)} L / month`;
    return `₹${inr(price)} / month`;
  }
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} L`;
  return `₹${inr(price)}`;
}

/** Build a list of *possible* image URLs from many formats, then we preload+filter valid ones. */
function buildImageCandidates(p: PropertyRow): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    const s = u.trim();
    if (!s) return;
    // make relative paths point to /prop-pics
    const final = (s.startsWith("http") || s.startsWith("/")) ? s : `/prop-pics/${s.replace(/^\/+/, "")}`;
    if (!out.includes(final)) out.push(final);
  };

  const raw: any = (p as any).images;
  const seg = (p as any).segment ? String((p as any).segment).toLowerCase() : "";
  const slug = (p as any).slug ? String((p as any).slug).toLowerCase() : sluggify((p as any).id || (p as any).title);
  const folderGuesses: string[] = [];
  if (seg && slug) folderGuesses.push(`${seg}/${slug}`);
  if (slug) folderGuesses.push(`${slug}`);

  // 1) If images is an array
  if (Array.isArray(raw)) {
    raw.forEach((r) => push(String(r || "")));
  }

  // 2) If images is a string
  if (typeof raw === "string") {
    const text = raw.trim();

    // FOLDER::segment/slug/* or segment/slug/* or segment/slug (no extension)
    if (text.startsWith("FOLDER::")) {
      const folder = text.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"").replace(/^\/+/, "");
      // try 1..20 with multiple extensions (pointing under new-launch for FOLDER)
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => push(`/prop-pics/new-launch/${folder}/${i}.${ext}`));
      }
    } else if (/(.+\/.+)(\*|$)/.test(text) && !/\.[a-z0-9]+$/i.test(text)) {
      const folder = text.replace(/\/?\*$/,"").replace(/^\/+/,"");
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => push(`/prop-pics/new-launch/${folder}/${i}.${ext}`));
      }
    } else if (text.includes(",")) {
      text.split(",").map(s => s.trim()).forEach((x) => push(x));
    } else if (text) {
      push(text);
    }
  }

  // 3) Fallback guesses using segment/slug and slug only
  folderGuesses.forEach((folder) => {
    for (let i = 1; i <= 20; i++) {
      ["jpg","jpeg","png","webp"].forEach(ext => push(`/prop-pics/${folder}/${i}.${ext}`));
    }
  });

  // 4) As a final single-file guess
  folderGuesses.forEach((folder) => {
    ["jpg","jpeg","png","webp"].forEach(ext => push(`/prop-pics/${folder}.${ext}`));
  });

  return out;
}

/** Preload all candidates and keep only valid ones */
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
  if (!slug) return null; // do NOT render on /properties?...

  const key = sluggify(String(slug || ""));
  const location = useLocation() as { state?: { property?: PropertyRow } };

  // if we came from a card, use that immediately
  const propFromState = location?.state?.property ?? null;

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!propFromState);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1) main sheet
        const data = await fetchSheet();
        if (!alive) return;

        // 2) new launch CSV ko PropertyRow shape me map karke merge
        try {
          const nl = await fetchNewLaunch();
          const mapped = nl.map((p: any) => {
            const slug = (p.slug || sluggify(p.project_name || p.project_id || "")).toString().trim().toLowerCase();
            return {
              id: p.project_id || slug,
              slug: slug,
              title: p.project_name || p.title || slug,
              location: `${p.locality || ""}${p.locality ? ", " : ""}${p.city || ""}`.replace(/^, |, $/, ""),
              price: p.price ? Number(p.price) : 0,
              // set both fields so downstream filters/readers that use either will work
              listingFor: "under-construction" as const,
              for: "under-construction",
              // segment used by filters (residential/commercial)
              segment: (p.segment || "residential").toString().toLowerCase(),
              description: p.description || `${p.developer_name || ""} new launch in ${p.locality || p.city || "Mumbai"}.`,
              // ensure image folder resolves to /prop-pics/new-launch/<slug>/*
              images: p.gallery_image_urls || `FOLDER::${slug}/*`,
              brochure_url: p.brochure_url || ""
            } as PropertyRow;
          }) as PropertyRow[];
          // merge sheet data + new launches (sheet first so sheet items remain priority)
          if (alive) setRows([...data, ...mapped]);
        } catch (err) {
          // fallback: only sheet data
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

  // Build + preload images once we have the property
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

  const [index, setIndex] = useState(0);
  const [fit, setFit] = useState<"contain"|"cover">("contain");
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);
  const goto = (i: number) => setIndex(i);

  const waNumber = "919920214015";
  const waText = `Hi, I'm interested in ${property.title} (${priceLabel(property.price, property.listingFor)}). Please share details.`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">Properties</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{property.title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{property.title}</h1>
            {property.location ? (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin size={18} /> {property.location}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block bg-black text-white px-4 py-2 rounded-lg font-semibold">
              {priceLabel(property.price, property.listingFor)}
            </span>
            <a href={waLink} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              <MessageCircle size={18}/> Enquire on WhatsApp
            </a>
            <a href="tel:+919920214015"
               className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
              <Phone size={18}/> Call Now
            </a>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {imgLoading ? (
            <div className="p-12 text-center text-gray-500">Loading photos…</div>
          ) : images.length ? (
            <>
              <div className="relative aspect-[16/9] bg-black/5">
                <img
                  src={images[index]}
                  alt={`${property.title} ${index + 1}`}
                  className={`w-full h-full ${fit === "contain" ? "object-contain bg-white" : "object-cover"}`}
                  loading="eager"
                />
                {images.length > 1 && (
                  <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronLeft/></button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronRight/></button>
                  </>
                )}
                <button
                  onClick={() => setFit(f => f === "contain" ? "cover" : "contain")}
                  className="absolute bottom-3 right-3 bg-white/90 rounded-md px-3 py-1 text-xs font-medium shadow"
                >
                  {fit === "contain" ? "Fit" : "Fill"}
                </button>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-gray-50">
                  {images.map((src, i) => (
                    <button key={src + i} onClick={() => goto(i)}
                            className={`h-20 rounded overflow-hidden border ${i === index ? "border-black ring-2 ring-gray-400" : "border-transparent"}`}>
                      <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">Photos coming soon</div>
          )}
        </div>

        {/* Facts + Enquiry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            {property.description ? <p className="text-gray-700">{property.description}</p> : null}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {property.bedrooms ? <div className="flex items-center gap-2"><Bed size={18}/> <span className="font-medium">{property.bedrooms} Bedrooms</span></div> : null}
              {property.bathrooms ? <div className="flex items-center gap-2"><Bath size={18}/> <span className="font-medium">{property.bathrooms} Bathrooms</span></div> : null}
              {property.areaSqft ? <div className="flex items-center gap-2"><Square size={18}/> <span className="font-medium">{property.areaSqft} sq ft</span></div> : null}
              {property.propertyType ? <div className="flex items-center gap-2"><span className="font-medium">{property.propertyType}</span></div> : null}
            </div>
          </div>

          <aside className="bg-white rounded-2xl shadow p-6 h-max sticky top-28">
            <div className="mt-6">
              <BrochureLeadBox project={{
                project_id: property.id,
                project_name: property.title,
                slug: property.slug || property.title,
                brochure_url: property.brochure_url || ""
              }}/>
            </div>
          </aside>

          <aside className="bg-white rounded-2xl shadow p-6 h-max sticky top-28">
            <div className="text-2xl font-semibold mb-2">{priceLabel(property.price, property.listingFor)}</div>
            {property.location ? <div className="text-sm text-gray-600 mb-4">{property.location}</div> : null}
            <a href={waLink} target="_blank" rel="noreferrer"
               className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold">
              <MessageCircle size={18}/> Enquire on WhatsApp
            </a>
            <a href="tel:+919920214015"
               className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold">
              <Phone size={18}/> Call Sahai Estates
            </a>
            <p className="text-xs text-gray-500 mt-4">RERA No: A51900001512</p>
          </aside>
        </div>
      </div>

      {/* Floating actions */}
      <a href={waLink} target="_blank" rel="noreferrer"
         className="fixed bottom-24 right-5 z-50 bg-green-600 text-white p-4 rounded-full shadow-xl hover:scale-110 hover:bg-green-700 transition-all"
         aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
      <a href="tel:+919920214015"
         className="fixed bottom-5 right-5 z-50 bg-black text-white p-4 rounded-full shadow-xl hover:scale-110 hover:bg-gray-800 transition-all"
         aria-label="Call">
        <Phone size={26} />
      </a>
    </div>
  );
}
