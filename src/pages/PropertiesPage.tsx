import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSheet, type PropertyRow } from '../data/sheet';

// Safe text helper
function toText(v: any): string | number | null {
  if (v == null) return null;
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string' || typeof x === 'number').join(', ');
  if (typeof v === 'object') {
    if ('label' in v) return v.label;
    if ('name' in v) return v.name;
    return Object.values(v)
      .filter(x => typeof x === 'string' || typeof x === 'number')
      .slice(0, 4)
      .join(', ');
  }
  return String(v);
}

export default function PropertyPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState<PropertyRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSheet();
        const found = data.find(
          (r) => r.slug?.toLowerCase() === String(slug).toLowerCase()
        );
        setProperty(found || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="pt-24 p-6 text-gray-600">Loading…</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 p-6">
        <h1 className="text-xl font-bold mb-2">Property not found</h1>
        <Link to="/" className="text-blue-600 underline">Back to home</Link>
      </div>
    );
  }

  const Field = ({ label, value }: { label: string; value: any }) => {
    const v = toText(value);
    if (!v) return null;
    return (
      <div className="flex gap-2 py-1">
        <div className="font-semibold min-w-40">{label}:</div>
        <div>{v}</div>
      </div>
    );
  };

  return (
    <div className="pt-24 max-w-6xl mx-auto p-6">
      <Link to="/" className="text-sm text-blue-600 underline mb-3 inline-block">{`←`} Back</Link>

      <h1 className="text-2xl font-serif font-bold mb-4">
        {property.title || property.name || 'Property'}
      </h1>

      {/* Images */}
      {Array.isArray(property.images) && property.images.length > 0 && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 mb-6">
          {property.images.map((img: string, i: number) => (
            <img
              className="w-full h-48 object-cover rounded-lg border"
              key={i}
              src={img}
              alt="Property"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Details */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <Field label="Location" value={property.location} />
        <Field label="Project" value={property.project} />
        <Field label="Bedrooms" value={property.bedrooms} />
        <Field label="Carpet Area" value={property.carpetArea} />
        <Field label="Price" value={property.priceFormatted || property.price} />
        <Field label="Listing For" value={property.listingFor} />
        <Field label="Property Type" value={property.propertyType} />
        <Field label="Facing" value={property.facing} />
        <Field label="Parking" value={property.parking} />
      </div>

      {/* Amenities */}
      {Array.isArray(property.amenities) && property.amenities.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-lg">Amenities</h2>
          <ul className="list-disc pl-6 space-y-1">
            {property.amenities.map((a, i) => (
              <li key={i}>{toText(a)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact Button */}
      <a
        href={`https://wa.me/8286006356?text=Hi%20I%20am%20interested%20in%20${encodeURIComponent(property.title || '')}`}
        className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contact on WhatsApp
      </a>
    </div>
  );
}
