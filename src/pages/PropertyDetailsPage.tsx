import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Phone, MessageCircle } from "lucide-react";

// Mock fallback — remove if not needed
import { properties as mock } from "../data/mockData";

/* utils */
const cr = (p?: number) => (p ? p / 1e7 : undefined);
const formatPrice = (p?: number) => (p ? `₹${cr(p)?.toFixed(2)} Cr` : "Price on request");
const normalize = (row: any) => ({
  id: row.id ?? "",
  title: row.title ?? "Property",
  description: row.description ?? "",
  location: row.location ?? "",
  areaLocality: row.areaLocality ?? "",
  price: row.price,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  areaSqft: row.areaSqft,
  propertyType: row.propertyType ?? "",
  amenities: Array.isArray(row.amenities) ? row.amenities : [],
  images: Array.isArray(row.images) ? row.images : [],
  isFeatured: !!row.isFeatured,
});

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSheet();
        if (!alive) return;
        const mapped = data.map(normalize);
        setRows(mapped.length ? mapped : mock.map(normalize));
      } catch {
        setRows(mock.map(normalize));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const property = useMemo(() => rows.find(p => p.id === id) ?? null, [rows, id]);

  if (loading) return <div className="pt-40 text-center text-gray-500">Loading property…</div>;

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link to="/properties" className="mt-4 inline-block bg-navy-900 text-white px-4 py-2 rounded">Back</Link>
      </div>
    );
  }

  const imgs = property.images ?? [];
  const [index, setIndex] = useState(0);
  const waText = `Hi, I'm interested in ${property.title} (${formatPrice(property.price)}). Please share details.`;
  const waLink = `https://wa.me/919920214015?text=${encodeURIComponent(waText)}`;

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <nav className="text-sm mb-3">
          <Link to="/" className="underline">Home</Link> / 
          <Link to="/properties" className="underline">Properties</Link> / 
          {property.title}
        </nav>

        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="flex gap-2 text-gray-600"><MapPin size={18}/> {property.location}</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-navy-900 text-white px-4 py-2 rounded">{formatPrice(property.price)}</span>
            <a href={waLink} target="_blank" className="bg-green-600 text-white px-4 py-2 rounded flex gap-2 items-center"><MessageCircle size={18}/>WhatsApp</a>
            <a href="tel:+919920214015" className="bg-brand-600 text-white px-4 py-2 rounded flex gap-2 items-center"><Phone size={18}/>Call</a>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          {imgs.length ? (
            <div className="relative">
              <img src={imgs[index]} className="w-full h-[420px] object-cover" />
              <button className="absolute left-2 top-1/2 bg-white p-2 rounded" onClick={() => setIndex((i) => (i - 1 + imgs.length) % imgs.length)}><ChevronLeft/></button>
              <button className="absolute right-2 top-1/2 bg-white p-2 rounded" onClick={() => setIndex((i) => (i + 1) % imgs.length)}><ChevronRight/></button>
            </div>
          ) : <div className="p-10 text-center text-gray-500">Photos coming soon</div>}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold text-xl mb-2">Overview</h2>
            <p>{property.description}</p>

            <div className="grid grid-cols-2 mt-4 gap-4 text-sm">
              <span className="flex gap-2 items-center"><Bed size={18}/>{property.bedrooms} Beds</span>
              <span className="flex gap-2 items-center"><Bath size={18}/>{property.bathrooms} Baths</span>
              <span className="flex gap-2 items-center"><Square size={18}/>{property.areaSqft} sq ft</span>
              <span>{property.propertyType}</span>
            </div>
          </div>

          <aside className="bg-white p-6 rounded-lg shadow sticky top-28">
            <span className="text-xl font-semibold">{formatPrice(property.price)}</span>
            <p className="text-gray-500">{property.location}</p>
            <a href={waLink} target="_blank" className="block w-full bg-green-600 text-white py-3 rounded mt-4 text-center font-semibold">WhatsApp</a>
            <a href="tel:+919920214015" className="block w-full bg-navy-900 text-white py-3 rounded mt-2 text-center font-semibold">Call</a>
          </aside>
        </div>

        <Link to="/properties" className="text-brand-600 underline block mt-6">&larr; Back to properties</Link>
      </div>
    </div>
  );
}
