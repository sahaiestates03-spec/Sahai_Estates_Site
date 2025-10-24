import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
    }`;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/Sahai Estates 131.png" alt="Sahai Estates" className="h-7 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkClasses}>Home</NavLink>
          <NavLink to="/properties" className={linkClasses}>Properties</NavLink>
          <NavLink to="/about" className={linkClasses}>About</NavLink>
          <NavLink to="/services" className={linkClasses}>Services</NavLink>
          <NavLink to="/contact" className={linkClasses}>Contact</NavLink>

          <a
            href="tel:+919920214015"
            className="ml-3 inline-flex items-center rounded-md bg-navy-900 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-600"
          >
            📞 Call Now
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/" className={linkClasses} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/properties" className={linkClasses} onClick={() => setOpen(false)}>Properties</NavLink>
            <NavLink to="/about" className={linkClasses} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/services" className={linkClasses} onClick={() => setOpen(false)}>Services</NavLink>
            <NavLink to="/contact" className={linkClasses} onClick={() => setOpen(false)}>Contact</NavLink>
            <a
              href="tel:+919920214015"
              className="block mt-2 rounded-md bg-navy-900 text-white px-4 py-2 text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              📞 Call Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
