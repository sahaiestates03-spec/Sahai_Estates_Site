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

/* -------- Currency Format Helpers -------- */

function formatINR(n: number) {
  return n.toLocaleString("en-IN");
}

function formatPrice(
  price?: number,
  forWhat?: "resale" | "rent" | "under-construction"
) {
  if (!price || price <= 0) {
    return forWhat === "rent" ? "₹ — / month" : "Price on request";
  }

  // RENT
  if (forWhat === "rent") {
    if (price >= 1e5) {
      const lakhs = price / 1e5; // 1 Lakh = 100,000
      const digits = lakhs >= 10 ? 1 : 2;
      return `${lakhs.toFixed(digits)} L / month`;
    }
    return `₹${formatINR(price)} / month`;
  }

  // SALE — Cr / Lakh / ₹
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} L`;
  return `₹${formatINR(price)}`;
}

/* -------- Page Component -------- */
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

  const property = useMemo(
    () => rows.find((p) => p.id === id),
    [rows, id]
  );

  const [i, setI] = useState(0);
  const [fit, setFit] = useState<"contain" | "cover">("contain");

  if (loading) return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block bg-navy-900 text-white px-4 py-2 rounded">
          Back to Properties
        </Link>
      </div>
    );
  }

  const imgs = (property?.images ?? []).filter(Boolean);

  // WhatsApp link
  const whatsappNumber = "919920214015";
  const waText = `Hi, I'm interested in ${property.title} (${formatPrice(property.price, property.listingFor as any)}). Please share details.`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="underline">Home</Link> / 
          <Link to="/properties" className="underline">Properties</Link> / {property.title}
        </nav>

        {/* Title + Price */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="flex gap-2 text-gray-600 items-center">
              <MapPin size={18} /> {property.location}
            </p>
          </div>

          <span className="bg-navy-900 text-white px-4 py-2 rounded text-lg font-semibold">
            {formatPrice(property.price, property.listingFor as any)}
          </span>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="relative aspect-[16/9] bg-black/5">
            {imgs.length ? (
              <img
                src={imgs[i]}
                alt={`image ${i + 1}`}
                className={`w-full h-full ${fit === "contain" ? "object-contain bg-white" : "object-cover"}`}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-500">Photos coming soon</div>
            )}

            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setI((i - 1 + imgs.length) % imgs.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"
                ><ChevronLeft /></button>

                <button
                  onClick={() => setI((i + 1) % imgs.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"
                ><ChevronRight /></button>
              </>
            )}

            {/* Fit/Fill toggle */}
            {imgs.length > 0 && (
              <button
                onClick={() => setFit(fit === "contain" ? "cover" : "contain")}
                className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 text-xs rounded shadow"
              >{fit === "contain" ? "Fit" : "Fill"}</button>
            )}
          </div>

          {imgs.length > 1 && (
            <div className="p-3 bg-gray-50 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {imgs.map((src, idx) => (
                <button key={idx} onClick={() => setI(idx)} className={`h-16 rounded-md overflow-hidden ring-2 ${idx === i ? "ring-brand-500" : "ring-transparent hover:ring-gray-300"}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p>{property.description || "Details to be updated."}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.bedrooms && <div className="flex gap-2 items-center"><Bed size={18}/> {property.bedrooms} Bedrooms</div>}
              {property.bathrooms && <div className="flex gap-2 items-center"><Bath size={18}/> {property.bathrooms} Bathrooms</div>}
              {property.areaSqft && <div className="flex gap-2 items-center"><Square size={18}/> {property.areaSqft} sq ft</div>}
              {property.propertyType && <div>{property.propertyType}</div>}
            </div>
          </div>

          {/* Contact Card */}
          <aside className="bg-white p-6 rounded-lg shadow h-max">
            <div className="text-2xl font-semibold mb-1">
              {formatPrice(property.price, property.listingFor as any)}
            </div>
            <div className="text-sm text-gray-600 mb-4">{property.location}</div>

            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 backdrop-blur-md bg-green-600/20 border border-green-400/40 hover:bg-green-500/30 py-3 rounded-xl font-semibold text-green-600 hover:text-green-700 shadow-lg"
            >
              <MessageCircle size={20}/> WhatsApp
            </a>

            {/* Call */}
            <a
              href="tel:+919920214015"
              className="w-full flex items-center justify-center gap-2 mt-3 backdrop-blur-md bg-black/20 border border-black/40 hover:bg-black/40 py-3 rounded-xl font-semibold text-black hover:text-white shadow-lg"
            >
              <Phone size={20}/> Call Now
            </a>
          </aside>
        </div>
      </div>

      {/* Floating Buttons */}
      <a href={waLink} target="_blank" className="fixed bottom-24 right-5 z-50 bg-green-600 text-white p-4 rounded-full shadow-xl hover:scale-110">
        <MessageCircle size={26}/>
      </a>

      <a href="tel:+919920214015" className="fixed bottom-5 right-5 z-50 bg-black text-white p-4 rounded-full shadow-xl hover:scale-110">
        <Phone size={26}/>
      </a>
    </div>
  );
}
