import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import {
  MapPin, Bed, Bath, Square, Phone, MessageCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";

/* ---------- helpers ---------- */
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

function looksLikeFolder(v: unknown) {
  return typeof v === "string" && /\/$|\*$/i.test(v);
}

function expandImages(p?: PropertyRow): string[] {
  if (!p) return [];
  const raw = (p as any).images;
  if (Array.isArray(raw)) return raw.filter(Boolean);

  const text = typeof raw === "string" ? raw.trim() : "";
  if (text.startsWith("FOLDER::")) {
    const folder = text.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"");
    return Array.from({ length: 12 }, (_, i) => `/prop-pics/${folder}/${i+1}.jpg`);
  }
  if (looksLikeFolder(text)) {
    const folder = text.replace(/\/?\*$/,"").replace(/^\/+/,"");
    return Array.from({ length: 12 }, (_, i) => `/prop-pics/${folder}/${i+1}.jpg`);
  }
  if (text.includes(",")) {
    return text.split(",").map(s => s.trim())
      .filter(Boolean)
      .map(x => (x.startsWith("http") || x.startsWith("/")) ? x : `/prop-pics/${x}`);
  }
  if (text) {
    return [(text.startsWith("http") || text.startsWith("/")) ? text : `/prop-pics/${text}`];
  }
  return [];
}

/* ---------- component ---------- */
export default function PropertyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const property = useMemo(
    () => rows.find(p => p.slug?.toLowerCase() === String(slug).toLowerCase()),
    [rows, slug]
  );

  if (loading) return <div className="pt-40 text-center text-gray-500">Loading...</div>;

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

  const imgs = expandImages(property);
  const [index, setIndex] = useState(0);
  const [fit, setFit] = useState<"contain"|"cover">("contain");

  const prev = () => setIndex(i => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIndex(i => (i + 1) % imgs.length);
  const goto = (i: number) => setIndex(i);

  const waNumber = "919920214015";
  const waText = `Hi, I'm interested in ${property.title} (${priceLabel(property.price, property.listingFor)}).`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">

        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/properties" className="hover:underline">Properties</Link> /{" "}
          <span className="text-gray-700">{property.title}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{property.title}</h1>
            {property.location && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin size={18} /> {property.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block bg-black text-white px-4 py-2 rounded-lg font-semibold">
              {priceLabel(property.price, property.listingFor)}
            </span>
            <a href={waLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              <MessageCircle size={18}/> WhatsApp
            </a>
            <a href="tel:+919920214015"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
              <Phone size={18}/> Call
            </a>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {imgs.length ? (
            <div className="relative aspect-[16/9] bg-black/5">
              <img
                src={imgs[index]}
                alt={property.title}
                className={`w-full h-full ${fit === "contain" ? "object-contain bg-white" : "object-cover"}`}
              />
              {imgs.length > 1 && (
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
          ) : (
            <div className="p-12 text-center text-gray-500">Photos coming soon</div>
          )}

          {imgs.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-gray-50">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => goto(i)}
                  className={`h-20 rounded overflow-hidden border ${i === index ? "border-black ring-2 ring-gray-400" : "border-transparent"}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            {property.description && <p className="text-gray-700">{property.description}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {property.bedrooms && <div className="flex items-center gap-2"><Bed size={18}/> {property.bedrooms} Bedrooms</div>}
              {property.bathrooms && <div className="flex items-center gap-2"><Bath size={18}/> {property.bathrooms} Bathrooms</div>}
              {property.areaSqft && <div className="flex items-center gap-2"><Square size={18}/> {property.areaSqft} sq ft</div>}
              {property.propertyType && <div className="font-medium">{property.propertyType}</div>}
            </div>
          </div>

          <aside className="bg-white rounded-2xl shadow p-6 h-max sticky top-28">
            <div className="text-2xl font-semibold mb-2">{priceLabel(property.price, property.listingFor)}</div>
            <a href={waLink} className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold" target="_blank"><MessageCircle size={18}/> WhatsApp</a>
            <a href="tel:+919920214015" className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg font-semibold"><Phone size={18}/> Call</a>
            <p className="text-xs text-gray-500 mt-4">RERA No: A51900001512</p>
          </aside>
        </div>
      </div>

      {/* Floating buttons */}
      <a href={waLink} target="_blank" className="fixed bottom-24 right-5 z-50 bg-green-600 text-white p-4 rounded-full shadow-xl"><MessageCircle size={26} /></a>
      <a href="tel:+919920214015" className="fixed bottom-5 right-5 z-50 bg-black text-white p-4 rounded-full shadow-xl"><Phone size={26} /></a>
    </div>
  );
}
