import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [propsOpenMobile, setPropsOpenMobile] = useState(false);

  // Close menus on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPropsOpen(false);
        setPropsOpenMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? "text-brand-600" : "text-gray-800 hover:text-brand-600"
    }`;

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/30 border-b border-white/10 shadow-sm">
      {/* tiny fade utility for dropdown */}
      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO (bigger + shifted) */}
          <Link to="/" className="flex items-center gap-3 ml-4 md:ml-8 lg:ml-12">
            <img
              src="/logo.png" /* update if needed */
              alt="Sahai Estates"
              className="h-10 md:h-12 lg:h-14 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
            <span className="hidden sm:block text-gray-900 font-semibold text-lg md:text-xl">
              Sahai Estates
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClasses}>Home</NavLink>

            {/* Properties mega dropdown with hover-bridge */}
            <div
              className="relative"
              onMouseEnter={() => setPropsOpen(true)}
              onMouseLeave={() => setPropsOpen(false)}
            >
              <button
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-brand-600 inline-flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={propsOpen}
              >
                Properties
                <ChevronDown size={16} className={`transition-transform ${propsOpen ? "rotate-180" : ""}`} />
              </button>

              {propsOpen && (
                <>
                  {/* hover bridge to avoid flicker */}
                  <div className="absolute left-0 right-0 top-full h-3" />
                  <div
                    className="absolute left-0 top-full mt-2 w-[520px] bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/70 p-4 grid grid-cols-2 gap-4 z-50"
                    style={{ animation: "menuFadeIn 140ms ease-out" }}
                    role="menu"
                  >
                    {/* Residential */}
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Residential</div>
                      <ul className="space-y-1">
                        <li>
                          <NavLink
                            to="/properties?segment=residential&for=resale"
                            className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            onClick={() => setPropsOpen(false)}
                          >
                            Buy
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/properties?segment=residential&for=rent"
                            className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            onClick={() => setPropsOpen(false)}
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
                            className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            onClick={() => setPropsOpen(false)}
                          >
                            Buy
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/properties?segment=commercial&for=rent"
                            className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            onClick={() => setPropsOpen(false)}
                          >
                            Rent
                          </NavLink>
                        </li>
                      </ul>
                    </div>

                    {/* Project status */}
                    <div className="col-span-2 border-t pt-3">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Project Status</div>
                      <NavLink
                        to="/properties?for=under-construction"
                        className="inline-block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                        onClick={() => setPropsOpen(false)}
                      >
                        New Launch
                      </NavLink>
                    </div>
                  </div>
                </>
              )}
            </div>

            <NavLink to="/about" className={linkClasses}>About</NavLink>
            <NavLink to="/services" className={linkClasses}>Services</NavLink>
            <NavLink to="/blog" className={linkClasses}>Blog</NavLink>
            <NavLink to="/contact" className={linkClasses}>Contact</NavLink>

            <a
              href="tel:+919920214015"
              className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
            >
              📞 Call Now
            </a>
          </nav>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden mr-2 rounded-lg bg-white/70 px-3 py-2"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-gray-900">
            <NavLink to="/" className={linkClasses} onClick={() => setOpen(false)}>Home</NavLink>

            {/* Properties accordion */}
            <div className="border rounded-md">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800"
                onClick={() => setPropsOpenMobile(v => !v)}
                aria-expanded={propsOpenMobile}
                aria-controls="mobile-props"
              >
                <span>Properties</span>
                <ChevronDown size={16} className={`transition-transform ${propsOpenMobile ? "rotate-180" : ""}`} />
              </button>

              {propsOpenMobile && (
                <div id="mobile-props" className="px-2 pb-2">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-1">Residential</div>
                  <NavLink to="/properties?segment=residential&for=resale" className={linkClasses} onClick={() => setOpen(false)}>Buy</NavLink>
                  <NavLink to="/properties?segment=residential&for=rent" className={linkClasses} onClick={() => setOpen(false)}>Rent</NavLink>

                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-3 mb-1">Commercial</div>
                  <NavLink to="/properties?segment=commercial&for=resale" className={linkClasses} onClick={() => setOpen(false)}>Buy</NavLink>
                  <NavLink to="/properties?segment=commercial&for=rent" className={linkClasses} onClick={() => setOpen(false)}>Rent</NavLink>

                  <div className="text-xs uppercase tracking-wide text-gray-500 mt-3 mb-1">Project Status</div>
                  <NavLink to="/properties?for=under-construction" className={linkClasses} onClick={() => setOpen(false)}>New Launch</NavLink>
                </div>
              )}
            </div>

            <NavLink to="/about" className={linkClasses} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/services" className={linkClasses} onClick={() => setOpen(false)}>Services</NavLink>
            <NavLink to="/blog" className={linkClasses} onClick={() => setOpen(false)}>Blog</NavLink>
            <NavLink to="/contact" className={linkClasses} onClick={() => setOpen(false)}>Contact</NavLink>

            <a
              href="tel:+919920214015"
              className="mt-2 inline-flex w-max items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold"
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
