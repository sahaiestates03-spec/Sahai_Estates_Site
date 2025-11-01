import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSheet, type PropertyRow } from '../data/sheet';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Phone, MessageCircle } from 'lucide-react';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [properties, setProperties] = useState<PropertyRow[] | null>(null);

  useEffect(() => {
    fetchSheet().then(setProperties).catch(() => setProperties([]));
  }, []);

  const property = useMemo(() => {
    if (!properties) return null;
    return properties.find(p => p.id === id);
  }, [properties, id]);

  if (properties === null) {
    return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">Properties</Link> <span className="mx-1">/</span>
          <span>Not found</span>
        </nav>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <p className="mt-2 text-gray-600">The listing you’re looking for doesn’t exist or was removed.</p>
        <Link to="/properties" className="inline-block mt-6 px-5 py-3 bg-navy-900 text-white rounded-lg">Back to Properties</Link>
      </div>
    );
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  };

  const [index, setIndex] = useState(0);
  const imgs = property.images ?? [];
  const prev = () => setIndex(i => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIndex(i => (i + 1) % imgs.length);
  const goto = (i: number) => setIndex(i);

  const whatsappNumber = '919920214015';
  const waText = `Hi, I'm interested in ${property.title} (${formatPrice(property.price)}). Please share details.`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">

        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">Properties</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{property.title}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{property.title}</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin size={18} /> {property.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block bg-navy-900 text-white px-4 py-2 rounded-lg font-semibold">{formatPrice(property.price)}</span>
            <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              <MessageCircle size={18}/> Enquire on WhatsApp
            </a>
            <a href="tel:+919920214015" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold">
              <Phone size={18}/> Call Now
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {imgs.length > 0 ? (
            <div className="relative">
              <img src={imgs[index]} alt={`${property.title} ${index + 1}`} className="w-full h-[420px] md:h-[520px] object-cover" loading="eager" />
              {imgs.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
                    <ChevronLeft />
                  </button>
                  <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">Photos coming soon</div>
          )}

          {imgs.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-gray-50">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => goto(i)} className={`h-20 rounded overflow-hidden border ${i === index ? 'border-brand-600 ring-2 ring-brand-300' : 'border-transparent'}`}>
                  <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-700">{property.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2"><Bed size={18}/> <span className="font-medium">{property.bedrooms} Bedrooms</span></div>
              <div className="flex items-center gap-2"><Bath size={18}/> <span className="font-medium">{property.bathrooms} Bathrooms</span></div>
              <div className="flex items-center gap-2"><Square size={18}/> <span className="font-medium">{property.areaSqft} sq ft</span></div>
              <div className="flex items-center gap-2"><span className="font-medium">{property.propertyType}</span></div>
            </div>

            {property.amenities?.length ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <ul className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <li key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="bg-white rounded-2xl shadow p-6 h-max sticky top-28">
            <div className="text-2xl font-semibold mb-2">{formatPrice(property.price)}</div>
            <div className="text-sm text-gray-600 mb-4">{property.location}</div>
            <a href={waLink} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold">
              <MessageCircle size={18}/> Enquire on WhatsApp
            </a>
            <a href="tel:+919920214015" className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-brand-600 text-white px-4 py-3 rounded-lg font-semibold">
              <Phone size={18}/> Call Sahai Estates
            </a>
            <p className="text-xs text-gray-500 mt-4">RERA No: A51900001512</p>
          </aside>
        </div>

        <div>
          <Link to="/properties" className="text-brand-600 hover:text-brand-700 font-semibold">&larr; Back to all properties</Link>
        </div>
      </div>
    </div>
  );
}
