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
    if (price >= 1e5) return `${(price / 1e5).toFixed(price/1e5 >= 10 ? 1 : 2)} L / month`;
    return `₹${inr(price)} / month`;
  }
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} L`;
  return `₹${inr(price)}`;
}

/** Build a list of *possible* image URLs from many formats, then we preload+filter valid ones. 
 *  Tolerant rules:
 *   - accepts comma, pipe or semicolon separated lists
 *   - accepts FOLDER::new-launch/foo/* OR FOLDER::prop-pics/new-launch/foo/*
 *   - avoids duplicating `new-launch/new-launch` when folder already contains 'new-launch'
 */
function buildImageCandidates(p: PropertyRow): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    const s = String(u).trim();
    if (!s) return;
    // if absolute URL or starts with slash, keep as-is; otherwise make relative to /prop-pics
    const final = (s.startsWith("http") || s.startsWith("/")) ? s : `/prop-pics/${s.replace(/^\/+/, "")}`;
    if (!out.includes(final)) out.push(final);
  };

  const raw: any = (p as any).images || (p as any).gallery_image_urls || (p as any).gallery;
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

    // Accept separators: comma, pipe, semicolon
    const separators = /[,\|;]+/;

    // FOLDER::... handling (tolerant)
    if (text.toUpperCase().startsWith("FOLDER::")) {
      let folder = text.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"").replace(/^\/+/, "");
      // if user provided full path like "prop-pics/new-launch/slug" remove leading prop-pics/
      folder = folder.replace(/^prop-pics\//i, "");
      // If folder already contains 'new-launch' use directly; otherwise assume it is relative to new-launch folder
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? `/prop-pics/new-launch/${folder}/${i}.${ext}`
            : `/prop-pics/${folder}/${i}.${ext}`;
          push(candidate);
        });
      }
    } else if (/(.+\/.+)(\*|$)/.test(text) && !/\.[a-z0-9]+$/i.test(text)) {
      // folder pattern like "segment/slug/*" or "new-launch/slug/*"
      let folder = text.replace(/\/?\*$/,"").replace(/^\/+/,"");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? `/prop-pics/new-launch/${folder}/${i}.${ext}`
            : `/prop-pics/${folder}/${i}.${ext}`;
          push(candidate);
        });
      }
    } else if (separators.test(text)) {
      text.split(separators).map(s => s.trim()).forEach((x) => push(x));
    } else if (text) {
      push(text);
    }
  }

  // 3) Fallback guesses using segment/slug and slug only (non-new-launch generic locations)
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
  if (!slug) return null; // do NOT render on /properties?... (safety)

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
            const slugValue = (p.slug || sluggify(p.project_name || p.project_id || "")).toString().trim().toLowerCase();
            
            // Parse carpet area range
            let carpetArea = undefined;
            if (p.carpet_min || p.carpet_max) {
              const min = p.carpet_min ? String(p.carpet_min).trim() : "";
              const max = p.carpet_max ? String(p.carpet_max).trim() : "";
              if (min && max) {
                carpetArea = `${min} - ${max}`;
              } else if (min) {
                carpetArea = `${min}+`;
              } else if (max) {
                carpetArea = `Up to ${max}`;
              }
            }
            
            return {
              id: p.project_id || slugValue,
              slug: slugValue,
              title: p.project_name || p.title || slugValue,
              location: `${p.locality || ""}${p.locality ? ", " : ""}${p.city || ""}`.replace(/^, |, $/, ""),
              price: p.price ? Number(p.price) : 0,
              listingFor: "under-construction" as const,
              for: "under-construction",
              segment: (p.segment || "residential").toString().toLowerCase(),
              description: p.description || `${p.developer_name || ""} new launch in ${p.locality || p.city || "Mumbai"}.`,
              images: p.gallery_image_urls || `FOLDER::${slugValue}/*`,
              brochure_url: p.brochure_url || "",
              
              // ✅ FIXED: Add missing fields from Google Sheet columns
              bedrooms: p.beds_option || p.unit_types || undefined,  // Map from beds_option or unit_types
              propertyType: p.unit_types || undefined,  // Map from unit_types column
              areaSqft: carpetArea || undefined,  // Carpet area range formatted
            } as PropertyRow;
          }) as PropertyRow[];
          if (alive) setRows([...data, ...mapped]);
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

  // Reset gallery index when images change so index never goes out of bounds
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

  const waNumber = "919920214015";
  // waText and waLink must be built only after property is available to avoid reading null
  const waText = property ? `Hi, I'm interested in ${property.title || property.project_name} (${priceLabel(property.price, property.listingFor)}). Please share details.` : "";
  const waLink = property ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : `https://wa.me/${waNumber}`;

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
          <div className="flex items-center gap-3">
            <span className="inline-block bg-black text-white px-4 py-2 rounded-lg font-semibold">
              {priceLabel(property.price, property.listingFor)}
            </span>
            <a href={waLink} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2
