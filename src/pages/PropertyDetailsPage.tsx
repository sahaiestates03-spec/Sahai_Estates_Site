import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import { properties as mock } from "../data/mockData";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Phone, MessageCircle } from "lucide-react";

function formatPrice(price?: number) {
  if (!price) return "Price on request";
  return `₹${(price / 1e7).toFixed(2)} Cr`;
}

function normalize(p: any) {
  return {
    id: p.id ?? "",
    title: p.title ?? "Property",
    description: p.description ?? "",
    location: p.location ?? "",
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqft: p.areaSqft,
    propertyType: p.propertyType ?? "",
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    images: Array.isArray(p.images) ? p.images : [],
  };
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sheet = await fetchSheet();
        setRows(sheet.length ? sheet.map(normalize) : mock.map(normalize));
      } catch {
        setRows(mock.map(normalize));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const property = useMemo(() => rows.find(p => p.id === id) ?? null, [rows, id]);

  if (loading) return <div className="pt-40 text-center text-gray-500">Loading…</div>;

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

  const imgs = property.images ?? [];
  const [i, setI] = useState(0);

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="underline">Home</Link> / 
          <Link to="/properties" className="underline">Properties</Link> / 
          {property.title}
        </nav>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="flex gap-2 text-gray-600"><MapPin size={18} /> {property.location}</p>
          </div>
          <span className="bg-navy-900 text-white px-4 py-2 rounded text-lg font-semibold">
            {formatPrice(property.price)}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {imgs.length ? (
            <div className="relative">
              <img src={imgs[i]} className="w-full h-[420px] object-cover" />
              {imgs.length > 1 && (
                <>
                  <button className="absolute left-2 top-1/2 bg-white p-2 rounded" onClick={() => setI((i - 1 + imgs.length) % imgs.length)}><ChevronLeft /></button>
                  <button className="absolute right-2 top-1/2 bg-white p-2 rounded" onClick={() => setI((i + 1) % imgs.length)}><ChevronRight /></button>
                </>
              )}
            </div>
          ) : <div className="p-10 text-center">Photos coming soon</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p>{property.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2"><Bed size={18} /> {property.bedrooms} Bedrooms</div>
              <div className="flex gap-2"><Bath size={18} /> {property.bathrooms} Bathrooms</div>
              <div className="flex gap-2"><Square size={18} /> {property.areaSqft} sq ft</div>
              <div>{property.propertyType}</div>
            </div>
          </div>

          <aside className="bg-white rounded-lg shadow p-6 space-y-3 sticky top-24">
            <a href={`https://wa.me/919920214015?text=Hi%2C%20interested%20in%20${property.title}`} className="block bg-green-600 text-white py-3 rounded text-center font-semibold">
              <MessageCircle className="inline" size={18}/> WhatsApp
            </a>
            <a href="tel:+919920214015" className="block bg-navy-900 text-white py-3 rounded text-center font-semibold">
              <Phone className="inline" size={18}/> Call
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
