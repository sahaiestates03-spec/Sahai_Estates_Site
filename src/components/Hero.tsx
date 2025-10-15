import { Search, MapPin, Home, IndianRupee } from 'lucide-react';
import { useState } from 'react';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [searchParams, setSearchParams] = useState({
    location: '',
    priceRange: '',
    bedrooms: ''
  });

  const handleSearch = () => {
    onNavigate('properties');
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 animate-fade-in">
          Luxury Living in
          <span className="block text-brand-500 mt-2">South Mumbai</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light">
          Discover exclusive sea-facing apartments and premium residences
          in Mumbai's most prestigious neighborhoods
        </p>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              >
                <option value="">Select Location</option>
                <option value="worli">Worli</option>
                <option value="malabar-hill">Malabar Hill</option>
                <option value="breach-candy">Breach Candy</option>
                <option value="cuffe-parade">Cuffe Parade</option>
                <option value="pedder-road">Pedder Road</option>
                <option value="prabhadevi">Prabhadevi</option>
              </select>
            </div>

            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={searchParams.priceRange}
                onChange={(e) => setSearchParams({ ...searchParams, priceRange: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              >
                <option value="">Price Range</option>
                <option value="0-50000000">Up to ₹5 Cr</option>
                <option value="50000000-100000000">₹5 Cr - ₹10 Cr</option>
                <option value="100000000-150000000">₹10 Cr - ₹15 Cr</option>
                <option value="150000000+">Above ₹15 Cr</option>
              </select>
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={searchParams.bedrooms}
                onChange={(e) => setSearchParams({ ...searchParams, bedrooms: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              >
                <option value="">Bedrooms</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5+">5+ BHK</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
          >
            <Search size={20} />
            Search Properties
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onNavigate('properties')}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Explore Listings
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
}
