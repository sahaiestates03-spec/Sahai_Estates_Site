import HomeSearch from './HomeSearch';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-12 text-white">
      {/* OPTIONAL: background image overlay */}
      <div className="absolute inset-0 -z-10">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
          Luxury Living in <span className="text-brand-500">South Mumbai</span>
        </h1>
        <p className="mt-4 text-lg text-gray-200 max-w-3xl">
          Discover exclusive sea-facing apartments and premium residences in Mumbai's most prestigious neighborhoods
        </p>

        <div className="mt-6 flex gap-3">
          <Link to="/properties" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold">
            Explore Listings
          </Link>
          <Link to="/contact" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold">
            Contact Me
          </Link>
        </div>

        {/* ⬇️ NEW search panel */}
        <div className="mt-8">
          <HomeSearch />
        </div>
      </div>
    </section>
  );
}
