import { useParams } from 'react-router-dom';
import { properties } from '../data/mockData';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Property not found</h1>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    const cr = price / 10_000_000;
    return `₹${cr.toFixed(2)} Cr`;
  };

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">{property.title}</h1>
          <p className="text-gray-600">{property.location}</p>
          <p className="mt-2 font-semibold">{formatPrice(property.price)}</p>
        </div>

        {/* gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {property.images?.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${property.title} ${i + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow"
              loading="lazy"
            />
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p>{property.description}</p>
          <ul className="text-sm text-gray-700 grid sm:grid-cols-2 gap-1 mt-3">
            <li><strong>Bedrooms:</strong> {property.bedrooms}</li>
            <li><strong>Bathrooms:</strong> {property.bathrooms}</li>
            <li><strong>Area:</strong> {property.areaSqft} sq ft</li>
            <li><strong>Type:</strong> {property.propertyType}</li>
            <li><strong>Status:</strong> {property.status}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
