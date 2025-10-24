import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { properties } from '../data/mockData';

export default function PropertiesPage() {
  const locationHook = useLocation();

  const [filters, setFilters] = useState({
    location: '',
    bedrooms: '',                // maps to ?bhk=
    propertyType: '',            // maps to ?ptype=
    searchQuery: '',
    minPrice: undefined as number | undefined,  // ?min=
    maxPrice: undefined as number | undefined,  // ?max=
    segment: '' as '' | 'residential' | 'commercial',           // ?segment=
    listingFor: '' as '' | 'rent' | 'resale' | 'under-construction', // ?for=
  });
  const [showFilters, setShowFilters] = useState(false);

  // Read query params from URL (coming from HomeSearch)
  useEffect(() => {
    const q = new URLSearchParams(locationHook.search);
    setFilters((prev) => ({
      ...prev,
      location: q.get('location') ?? '',
      minPrice: q.get('min') ? Number(q.get('min')) : undefined,
      maxPrice: q.get('max') ? Number(q.get('max')) : undefined,
      segment: (q.get('segment') as any) || '',
      listingFor: (q.get('for') as any) || '',
      bedrooms: q.get('bhk') ?? '',
      propertyType: q.get('ptype') ?? '',
    }));
  }, [locationHook.search]);

  const formatPrice = (p: number) => `₹${(p / 10_000_000).toFixed(2)} Cr`;

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // text search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) return false;
      }

      // location/area match (contains)
      if (filters.location) {
        const lq = filters.location.toLowerCase();
        const inLocation =
          p.location?.toLowerCase().includes(lq) ||
          p.areaLocality?.toLowerCase().includes(lq);
        if (!inLocation) return false;
      }

      // bedrooms
      if (filters.bedrooms && p.bedrooms !== parseInt(filters.bedrooms)) return false;

      // property type exact (case-insensitive)
      if (filters.propertyType && p.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false;

      // budget
      if (typeof filters.minPrice === 'number' && p.price < filters.minPrice) return false;
      if (typeof filters.maxPrice === 'number' && p.price > filters.maxPrice) return false;

      // segment (residential/commercial)
      if (filters.segment && p.segment?.toLowerCase() !== filters.segment) return false;

      // listing for (rent / resale / under-construction)
      if (filters.listingFor && p.listingFor?.toLowerCase() !== filters.listingFor) return false;

      return true;
    });
  }, [filters]);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Keep (or add) your on-page filters here if you want */}

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
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

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{p.title}</h3>
                  <p className="text-gray-600 mb-3">{p.location}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {p.description}
                  </p>

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
            <p className="text-gray-600">Try changing the filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
