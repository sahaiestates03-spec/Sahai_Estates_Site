import { Link } from 'react-router-dom';
import HomeSearch from './HomeSearch';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-40 md:pb-32 lg:pb-28 text-white">
      {/* Background is handled by <RotatingHero /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
          Luxury Living in{' '}
          <span className="bg-gradient-to-r from-brand-500 via-rose-500 to-brand-500 bg-clip-text text-transparent">
            South Mumbai
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-4 text-lg text-white/90 max-w-3xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          Discover exclusive sea-facing apartments and premium residences in Mumbai&apos;s most prestigious neighborhoods
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white
                       shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50
                       transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 focus-visible:ring-offset-transparent"
          >
            Explore Listings
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-white/15 px-6 py-3 font-semibold text-white
                       ring-1 ring-white/30 hover:bg-white/25 hover:ring-white/40
                       backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 focus-visible:ring-offset-transparent"
          >
            Contact Me
          </Link>
        </div>

        {/* Search panel */}
        <div className="mt-10 relative z-50">
          <HomeSearch />
        </div>
      </div>
    </section>
  );
}
