import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/20 border-b border-white/20 shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 ml-4 md:ml-8 lg:ml-12" aria-label="Sahai Estates - Home">
          <img
            src="/logo.png"          
            alt="Sahai Estates"
            className="h-12 md:h-14 lg:h-16 w-auto object-contain"
            loading="eager"
            decoding="async"
          />
          {/* ❌ duplicate text remove */}
          {/* <span className="hidden sm:block text-gray-900 font-semibold text-lg md:text-xl">
            Sahai Estates
          </span> */}
          {/* ✅ optional: keep for accessibility only (won't show visually) */}
          <span className="sr-only">Sahai Estates</span>
        </Link>


          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6 text-gray-900">
            <Link to="/" className="hover:text-brand-600 font-medium">Home</Link>
            <div className="relative group">
              <button className="hover:text-brand-600 font-medium">Properties ▾</button>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/70 p-2">
                <Link to="/properties?segment=residential&for=resale" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Buy (Residential)</Link>
                <Link to="/properties?segment=residential&for=rent" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Rent (Residential)</Link>
                <Link to="/properties?segment=commercial" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Commercial</Link>
              </div>
            </div>
            <Link to="/about" className="hover:text-brand-600 font-medium">About</Link>
            <Link to="/services" className="hover:text-brand-600 font-medium">Services</Link>
            <Link to="/blog" className="hover:text-brand-600 font-medium">Blog</Link>
            <Link to="/contact" className="hover:text-brand-600 font-medium">Contact</Link>
            <a href="tel:+919920214015" className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition">
              📞 Call Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden mr-2 rounded-lg bg-white/70 px-3 py-2"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-gray-900">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Home</Link>
            <Link to="/properties" onClick={() => setOpen(false)} className="py-2">Properties</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="py-2">About</Link>
            <Link to="/services" onClick={() => setOpen(false)} className="py-2">Services</Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="py-2">Blog</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2">Contact</Link>
            <a href="tel:+919920214015" className="mt-2 inline-flex w-max items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold">
              📞 Call Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
