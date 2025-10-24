import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { properties } from '../data/mockData';

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    bedrooms: '',
    propertyType: '',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const formatPrice = (price: number) => `₹${(price / 10_000_000).toFixed(2)} Cr`;

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (filters.location && p.location.toLowerCase() !== filters.location.toLowerCase()) return false;
      if (filters.bedrooms && p.bedrooms !== parseInt(filters.bedrooms)) return false;
      if (filters.propertyType && p.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false;
      if (
        filters.searchQuery &&
        !p.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Luxury <span className="text-brand-500">Properties</span>
          </h1>
          <p className="text-lg text-gray-300">
            Discover {filteredProperties.length} exclusive properties in South Mumbai
          </p>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Locations</option>
                    <option value="worli">Worli</option>
                    <option value="malabar hill">Malabar Hill</option>
                    <option value="breach candy">Breach Candy</option>
                    <option value="cuffe parade">Cuffe Parade</option>
                    <option value="pedder road">Pedder Road</option>
                    <option value="prabhadevi">Prabhadevi</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  >
                    <option value="">Any</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="villa">Villa</option>
                    <option value="duplex">Duplex</option>
                    <option value="sky villa">Sky Villa</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFilters({ location: '', priceRange: '', bedrooms: '', propertyType: '', searchQuery: '' })
                    }
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((p) => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* thumbnail */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-navy-900/90 text-white px-4 py-2 rounded-lg font-bold">
                    {formatPrice(p.price)}
                  </div>
                  {p.isFeatured && (
                    <div className="absolute top-4 left-4 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{p.title}</h3>
                  <p className="text-gray-600 mb-3">{p.location}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                    <span>🛏 {p.bedrooms} Beds</span>
                    <span>🛁 {p.bathrooms} Baths</span>
                    <span>📐 {p.areaSqft} sq ft</span>
                  </div>

                  <Link
                    to={`/properties/${p.id}`}
                    className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={() => setFilters({ location: '', priceRange: '', bedrooms: '', propertyType: '', searchQuery: '' })}
              className="bg-navy-900 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
