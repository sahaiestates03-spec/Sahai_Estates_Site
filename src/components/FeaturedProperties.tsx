import { properties } from '../data/mockData';
import PropertyCard from './PropertyCard';

interface FeaturedPropertiesProps {
  onNavigate: (page: string) => void;
}

export default function FeaturedProperties({ onNavigate }: FeaturedPropertiesProps) {
  const featuredProperties = properties.filter(p => p.isFeatured);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4">
            Featured <span className="text-brand-600">Properties</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked selection of our most exclusive luxury properties in South Mumbai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={() => onNavigate('properties')}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('properties')}
            className="bg-navy-900 hover:bg-brand-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 inline-block"
          >
            View All Properties
          </button>
        </div>
      </div>
    </section>
  );
}
