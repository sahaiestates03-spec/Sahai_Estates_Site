import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import { properties as mock } from "../data/mockData";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

function formatPrice(price?: number) {
  return price ? `₹${(price / 1e7).toFixed(2)} Cr` : "Price on request";
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSheet();
        setRows(data.length ? data : mock);
      } catch {
        setRows(mock);
      }
      setLoading(false);
    })();
  }, []);

  const property = useMemo(() => rows.find(p => p.id === id), [rows, id]);
  const [i, setI] = useState(0);

  if (loading) return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block bg-navy-900 text-white px-4 py-2 rounded">Back to Properties</Link>
      </div>
    );
  }

  const imgs = property.images ?? [];

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="underline">Home</Link> / 
          <Link to="/properties" className="underline">Properties</Link> / 
          {property.title}
        </nav>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="flex gap-2 text-gray-600 items-center"><MapPin size={18} />{property.location}</p>
          </div>
          <span className="bg-navy-900 text-white px-4 py-2 rounded text-lg font-semibold">{formatPrice(property.price)}</span>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {imgs.length ? (
            <div className="relative">
              <img src={imgs[i]} className="w-full h-[420px] object-cover" />
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setI((i - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 bg-white p-2 rounded"><ChevronLeft /></button>
                  <button onClick={() => setI((i + 1) % imgs.length)} className="absolute right-2 top-1/2 bg-white p-2 rounded"><ChevronRight /></button>
                </>
              )}
            </div>
          ) : <div className="p-10 text-center">Photos coming soon</div>}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p>{property.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2 items-center"><Bed size={18} /> {property.bedrooms} Bedrooms</div>
              <div className="flex gap-2 items-center"><Bath size={18} /> {property.bathrooms} Bathrooms</div>
              <div className="flex gap-2 items-center"><Square size={18} /> {property.areaSqft} sq ft</div>
              <div>{property.propertyType}</div>
            </div>
          </div>

          {/* Contact Buttons */}
{/* Premium Glass Buttons */}
<div className="space-y-3 mt-4">

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


        </div>
      </div>
    </div>
  );
}
