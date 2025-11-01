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

function formatPrice(price?: number) {
  return price ? `₹${(price / 1e7).toFixed(2)} Cr` : "Price on request";
}

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

  const [i, setI] = useState(0);
  const imgs = property?.images ?? [];

  // ----- WhatsApp link (this is what was missing) -----
  const whatsappNumber = "919920214015"; // country code + number (no +)
  const waText = property
    ? `Hi, I'm interested in ${property.title} (${formatPrice(
        property.price
      )}). Please share details.`
    : `Hi, I'm interested in a property. Please share details.`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    waText
  )}`;
  // ----------------------------------------------------

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
          <Link to="/" className="underline">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/properties" className="underline">
            Properties
          </Link>{" "}
          / {property.title}
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
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {imgs.length ? (
            <div className="relative">
              <img
                src={imgs[i]}
                className="w-full h-[420px] object-cover"
                alt={property.title}
              />
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setI((i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded shadow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setI((i + 1) % imgs.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded shadow"
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-gray-500">
              Photos coming soon
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

          {/* Enquiry Card with Glass Buttons */}
          <aside className="bg-white p-6 rounded-lg shadow h-max">
            <div className="text-2xl font-semibold mb-1">
              {formatPrice(property.price)}
            </div>
            {property.location ? (
              <div className="text-sm text-gray-600 mb-4">
                {property.location}
              </div>
            ) : null}

            {/* Premium Glass Buttons */}
            <div className="space-y-3 mt-2">
              {/* WhatsApp */}
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

              {/* Call */}
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

      {/* Floating WhatsApp Button */}
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

      {/* Floating Call Button */}
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
