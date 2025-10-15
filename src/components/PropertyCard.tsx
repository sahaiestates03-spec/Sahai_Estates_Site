import { Bed, Bath, Square, MapPin, ArrowRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: string) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    const crore = price / 10000000;
    return `₹${crore.toFixed(2)} Cr`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {property.isFeatured && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
        <div className="absolute top-4 right-4 bg-navy-900/90 text-white px-4 py-2 rounded-lg font-bold">
          {formatPrice(property.price)}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPin size={16} />
          <span className="text-sm font-medium">{property.location}</span>
        </div>

        <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-brand-600 transition-colors">
          {property.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center gap-6 mb-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-brand-600" />
            <span className="text-sm font-medium">{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath size={18} className="text-brand-600" />
            <span className="text-sm font-medium">{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-2">
            <Square size={18} className="text-brand-600" />
            <span className="text-sm font-medium">{property.areaSqft} sqft</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-gray-500 text-xs font-medium py-1">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        <button
          onClick={() => onViewDetails(property.id)}
          className="w-full bg-navy-900 hover:bg-brand-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
        >
          View Details
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
