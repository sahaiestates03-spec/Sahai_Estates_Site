import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false); // desktop hover guard
  const [propsOpenMobile, setPropsOpenMobile] = useState(false); // mobile accordion

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

          {/* Properties dropdown (desktop) */}
          <div
            className="relative"
            onMouseEnter={() => setPropsOpen(true)}
            onMouseLeave={() => setPropsOpen(false)}
          >
            <button
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 inline-flex items-center gap-1"
              aria-haspopup="menu"
              aria-expanded={propsOpen}
            >
              Properties
              <ChevronDown size={16} className={`transition-transform ${propsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu */}
            {propsOpen && (
              <div
                className="absolute left-0 mt-2 w-[520px] bg-white shadow-xl border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4 z-50"
                role="menu"
              >
                {/* Residential */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Residential</div>
                  <ul className="space-y-1">
                    <li>
                      <NavLink
                        to="/properties?segment=residential&for=resale"
                        className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Buy
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/properties?segment=residential&for=rent"
                        className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Rent
                      </NavLink>
                    </li>
                  </ul>
                </div>

                {/* Commercial */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Commercial</div>
                  <ul className="space-y-1">
                    <li>
                      <NavLink
                        to="/properties?segment=commercial&for=resale"
                        className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Buy
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/properties?segment=commercial&for=rent"
                        className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Rent
                      </NavLink>
                    </li>
                  </ul>
                </div>

                {/* Under Construction (full row) */}
                <div className="col-span-2 border-t pt-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Project Status</div>
                  <NavLink
                    to="/properties?for=under-construction"
                    className="inline-block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Under Construction
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink to="/about" className={linkClasses}>About</NavLink>
          <NavLink to="/services" className={linkClasses}>Services</NavLink>
          <NavLink to="/blog" className={linkClasses}>Blog</NavLink>
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

            {/* Properties accordion (mobile) */}
            <div className="border rounded-md">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700"
                onClick={() => setPropsOpenMobile(v => !v)}
              >
                <span>Properties</span>
                <ChevronDown size={16} className={`transition-transform ${propsOpenMobile ? 'rotate-180' : ''}`} />
              </button>

              {propsOpenMobile && (
                <div className="px-2 pb-2">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-1">Residential</div>
                  <NavLink
                    to="/properties?segment=residential&for=resale"
                    className={linkClasses}
                    onClick={() => setOpen(false)}
                  >
                    Buy
                  </NavLink>
                  <NavLink
                    to="/properties?segment=residential&for=rent"
                    className={linkClasses}
                    onClick={() => setOpen(false)}
                  >
                    Rent
                  </NavLink>

                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-3 mb-1">Commercial</div>
                  <NavLink
                    to="/properties?segment=commercial&for=resale"
                    className={linkClasses}
                    onClick={() => setOpen(false)}
                  >
                    Buy
                  </NavLink>
                  <NavLink
                    to="/properties?segment=commercial&for=rent"
                    className={linkClasses}
                    onClick={() => setOpen(false)}
                  >
                    Rent
                  </NavLink>

                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-3 mb-1">Project Status</div>
                  <NavLink
                    to="/properties?for=under-construction"
                    className={linkClasses}
                    onClick={() => setOpen(false)}
                  >
                    Under Construction
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/about" className={linkClasses} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/services" className={linkClasses} onClick={() => setOpen(false)}>Services</NavLink>
            <NavLink to="/blog" className={linkClasses} onClick={() => setOpen(false)}>Blog</NavLink>
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
