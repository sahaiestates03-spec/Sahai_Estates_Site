import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  if (!property) return null; // ✅ Prevents crash

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
    </div>
  );
}
