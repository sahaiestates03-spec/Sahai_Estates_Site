import { Link } from 'react-router-dom';
import { properties } from '../data/mockData';
import PropertyCard from './PropertyCard';

export default function FeaturedProperties() {
  const featured = properties.filter(p => p.isFeatured).slice(0, 6);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center">
          Featured <span className="text-brand-600">Properties</span>
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Handpicked selection of our most exclusive luxury properties in South Mumbai
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((p) => (
            <div key={p.id}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center px-5 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-brand-600"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
