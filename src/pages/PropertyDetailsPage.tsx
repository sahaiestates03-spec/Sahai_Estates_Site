// src/pages/PropertyDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import { properties as mock } from "../data/mockData";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { priceFormat } from "../utils/price";
import { discoverImages, looksLikeFolder } from "../utils/autoImages";
import { expandImages } from "../utils/normalize";


export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;
        setRows(data.length ? data : (mock as unknown as PropertyRow[]));
      } catch {
        setRows(mock as unknown as PropertyRow[]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const property = useMemo(
    () => rows.find((p) => p.id === id),
    [rows, id]
  );

  // ----- Gallery images (auto-discover from folder shorthand) -----
  const [imgs, setImgs] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!property) return;
      const raw = property.images || [];

      // If Sheet gave "FOLDER::<path>" (from normalizeImages)
      const folderToken = raw.find((x) => typeof x === "string" && x.startsWith("FOLDER::"));
      if (folderToken) {
        const folder = folderToken.replace("FOLDER::", "");
        const found = await discoverImages(folder, 20);
        if (!alive) return;
        setImgs(found);
        setLoadingImages(false);
        return;
      }

      // If older shorthand like "residential/Beaumonde-903A"
      if (raw.length === 1 && looksLikeFolder(raw[0])) {
        const found = await discoverImages(raw[0], 20);
        if (!alive) return;
        setImgs(found);
        setLoadingImages(false);
        return;
      }

      // Else normal explicit list
      setImgs(raw.filter(Boolean));
      setLoadingImages(false);
    })();
    return () => {
      alive = false;
    };
  }, [property]);

  // ----- UI state: gallery -----
  const [i, setI] = useState(0);
  const [fit, setFit] = useState<"contain" | "cover">("contain");

  // ----- WhatsApp link -----
  const whatsappNumber = "919920214015";
  const waText = property
    ? `Hi, I'm interested in ${property.title} (${priceFormat(property.price, property.listingFor)}). Please share details.`
    : `Hi, I'm interested in a property. Please share details.`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;

  if (loading) {
    return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Link
          to="/properties"
          className="mt-4 inline-block bg-navy-900 text-white px-4 py-2 rounded"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="underline">Home</Link> /{" "}
          <Link to="/properties" className="underline">Properties</Link> / {property.title}
        </nav>

        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            {property.location ? (
              <p className="flex gap-2 text-gray-600 items-center">
                <MapPin size={18} />
                {property.location}
              </p>
            ) : null}
          </div>
          <span className="bg-navy-900 text-white px-4 py-2 rounded text-lg font-semibold">
            {priceFormat(property.price, property.listingFor)}
          </span>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Main viewer */}
          <div className="relative aspect-[16/9] bg-black/5">
            {!loadingImages && imgs.length > 0 ? (
              <img
                src={imgs[i]}
                alt={`${property.title} ${i + 1}`}
                className={`w-full h-full ${fit === "contain" ? "object-contain bg-white" : "object-cover"}`}
                loading="eager"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-500">
                {loadingImages ? "Loading photos…" : "Photos coming soon"}
              </div>
            )}

            {/* Prev/Next */}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setI((prev) => (prev - 1 + imgs.length) % imgs.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                  aria-label="Previous photo"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => setI((prev) => (prev + 1) % imgs.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                  aria-label="Next photo"
                >
                  <ChevronRight />
                </button>
              </>
            )}

            {/* Fit / Fill toggle */}
            {imgs.length > 0 && (
              <button
                onClick={() => setFit((f) => (f === "contain" ? "cover" : "contain"))}
                className="absolute bottom-3 right-3 bg-white/90 hover:bg-white rounded-md px-3 py-1 text-xs font-medium shadow"
                title={fit === "contain" ? "Switch to Fill (cover)" : "Switch to Fit (contain)"}
              >
                {fit === "contain" ? "Fit" : "Fill"}
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div className="p-3 bg-gray-50">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {imgs.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`relative h-16 rounded-md overflow-hidden ring-2 ${
                      idx === i ? "ring-brand-500" : "ring-transparent hover:ring-gray-300"
                    }`}
                    aria-label={`Photo ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details + Enquiry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overview */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Overview</h2>
            {property.description ? (
              <p>{property.description}</p>
            ) : (
              <p className="text-gray-600">Details to be updated.</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.bedrooms ? (
                <div className="flex gap-2 items-center">
                  <Bed size={18} /> {property.bedrooms} Bedrooms
                </div>
              ) : null}
              {property.bathrooms ? (
                <div className="flex gap-2 items-center">
                  <Bath size={18} /> {property.bathrooms} Bathrooms
                </div>
              ) : null}
              {property.areaSqft ? (
                <div className="flex gap-2 items-center">
                  <Square size={18} /> {property.areaSqft} sq ft
                </div>
              ) : null}
              {property.propertyType ? (
                <div className="flex gap-2 items-center">
                  {property.propertyType}
                </div>
              ) : null}
            </div>
          </div>

          {/* Enquiry Card */}
          <aside className="bg-white p-6 rounded-lg shadow h-max">
            <div className="text-2xl font-semibold mb-1">
              {priceFormat(property.price, property.listingFor)}
            </div>
            {property.location ? (
              <div className="text-sm text-gray-600 mb-4">{property.location}</div>
            ) : null}

            <div className="space-y-3 mt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 
                backdrop-blur-md bg-green-600/20 border border-green-400/40 
                hover:bg-green-500/30 transition-all py-3 rounded-xl font-semibold 
                text-green-600 hover:text-green-700 shadow-lg hover:shadow-green-500/30"
              >
                <MessageCircle size={20} className="text-green-500" />
                WhatsApp
              </a>

              <a
                href="tel:+919920214015"
                className="w-full flex items-center justify-center gap-2 
                backdrop-blur-md bg-black/20 border border-black/40 
                hover:bg-black/40 transition-all py-3 rounded-xl font-semibold 
                text-black hover:text-white shadow-lg hover:shadow-black/30"
              >
                <Phone size={20} className="text-black" />
                Call Now
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating buttons */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-5 z-50 bg-green-600 text-white p-4 rounded-full 
        shadow-xl hover:scale-110 hover:bg-green-700 transition-all backdrop-blur-xl"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} />
      </a>

      <a
        href="tel:+919920214015"
        className="fixed bottom-5 right-5 z-50 bg-black text-white p-4 rounded-full 
        shadow-xl hover:scale-110 hover:bg-gray-800 transition-all backdrop-blur-xl"
        aria-label="Call"
      >
        <Phone size={26} />
      </a>
    </div>
  );
}
