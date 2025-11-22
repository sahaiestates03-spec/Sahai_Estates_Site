import HomeSearch from "./HomeSearch";

export default function Hero() {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Heading + subheading + buttons */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
          Luxury Living in <span className="text-red-400">South Mumbai</span>
        </h1>

        <p className="mt-4 text-base md:text-lg text-white/80">
          Discover exclusive sea-facing apartments and premium residences in Mumbai&apos;s
          most prestigious neighborhoods.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="#featured-properties"
            className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold shadow-md hover:bg-red-700"
          >
            Explore Listings
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-lg bg-white/80 text-gray-900 font-semibold shadow-md hover:bg-white"
          >
            Contact Me
          </a>
        </div>
      </div>

      {/* SEARCH BAR – bas yahi ek jagah */}
      <div className="w-full mt-10">
        <HomeSearch />
      </div>
    </div>
  );
}
