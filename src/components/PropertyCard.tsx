import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => `₹${(price / 10_000_000).toFixed(2)} Cr`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-navy-900/90 text-white px-4 py-2 rounded-lg font-bold">
          {formatPrice(property.price)}
        </div>
        {property.isFeatured && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
        <p className="text-gray-600 mb-3">{property.location}</p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
          <span>🛏 {property.bedrooms} Beds</span>
          <span>🛁 {property.bathrooms} Baths</span>
          <span>📐 {property.areaSqft} sq ft</span>
        </div>
      </div>
    </div>
  );
}
