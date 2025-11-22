// src/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [propOpen, setPropOpen] = useState(false);
  const [subOpen, setSubOpen] = useState<"res" | "com" | null>(null);

  const propOpenTimer = useRef<number | null>(null);
  const propCloseTimer = useRef<number | null>(null);
  const subOpenTimer = useRef<number | null>(null);
  const subCloseTimer = useRef<number | null>(null);

  const OPEN_DELAY = 120;
  const CLOSE_DELAY = 240;

  function clearTimer(ref: React.MutableRefObject<number | null>) {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearTimer(propOpenTimer);
      clearTimer(propCloseTimer);
      clearTimer(subOpenTimer);
      clearTimer(subCloseTimer);
    };
  }, []);

  const onPropEnter = () => {
    clearTimer(propCloseTimer);
    if (!propOpen) {
      clearTimer(propOpenTimer);
      propOpenTimer.current = window.setTimeout(
        () => setPropOpen(true),
        OPEN_DELAY
      );
    }
  };
  const onPropLeave = () => {
    clearTimer(propOpenTimer);
    clearTimer(subOpenTimer);
    propCloseTimer.current = window.setTimeout(() => {
      setPropOpen(false);
      setSubOpen(null);
    }, CLOSE_DELAY);
  };

  const onSubEnter = (which: "res" | "com") => {
    clearTimer(subCloseTimer);
    if (subOpen !== which) {
      clearTimer(subOpenTimer);
      subOpenTimer.current = window.setTimeout(
        () => setSubOpen(which),
        OPEN_DELAY
      );
    }
  };
  const onSubLeave = (which: "res" | "com") => {
    clearTimer(subOpenTimer);
    subCloseTimer.current = window.setTimeout(() => {
      setSubOpen((s) => (s === which ? null : s));
    }, CLOSE_DELAY);
  };

  const isActive = (path: string) => {
    const [p, q] = path.split("?");
    if (!p) return false;
    if (location.pathname !== p) return false;
    if (!q) return true;
    const params = new URLSearchParams(location.search);
    return q.split("&").every((pair) => {
      const [k, v] = pair.split("=");
      return params.get(k) === v;
    });
  };

  const baseLinkClass = "hover:text-brand-600 font-medium";
  const activeClass = "text-brand-600 font-medium";

  return (
    <nav className="fixed top-0 left-0 w-full z-[300] bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 ml-4 md:ml-8 lg:ml-12">
            <img
              src="/logo.png"
              alt="Sahai Estates"
              className="h-12 md:h-14 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-gray-900">
            <Link to="/" className={isActive("/") ? activeClass : baseLinkClass}>Home</Link>

            <Link to="/new-launch" className={isActive("/new-launch") ? activeClass : baseLinkClass}>New Launch</Link>

            <div
              className="relative"
              onMouseEnter={onPropEnter}
              onMouseLeave={onPropLeave}
            >
              <button
                type="button"
                className="hover:text-brand-600 font-medium inline-flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={propOpen}
              >
                Properties <span>▾</span>
              </button>

              {propOpen && (
                <div
                  className="absolute left-0 top-full mt-2 min-w-64 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[350]"
                  role="menu"
                >

                  <div
                    className="relative"
                    onMouseEnter={() => onSubEnter("res")}
                    onMouseLeave={() => onSubLeave("res")}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center justify-between"
                      aria-haspopup="menu"
                    >
                      Residential <span>▸</span>
                    </button>

                    {subOpen === "res" && (
                      <div
                        className="absolute left-full top-0 ml-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[360]"
                      >
                        <Link to="/properties?segment=residential&for=resale" className="block px-4 py-2 rounded-lg hover:bg-gray-50">
                          Buy (Sale)
                        </Link>
                        <Link to="/properties?segment=residential&for=rent" className="block px-4 py-2 rounded-lg hover:bg-gray-50">
                          Rent
                        </Link>
                      </div>
                    )}
                  </div>

                  <div
                    className="relative"
                    onMouseEnter={() => onSubEnter("com")}
                    onMouseLeave={() => onSubLeave("com")}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center justify-between"
                    >
                      Commercial <span>▸</span>
                    </button>

                    {subOpen === "com" && (
                      <div
                        className="absolute left-full top-0 ml-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[360]"
                      >
                        <Link to="/properties?segment=commercial&for=resale" className="block px-4 py-2 rounded-lg hover:bg-gray-50">
                          Buy (Sale)
                        </Link>
                        <Link to="/properties?segment=commercial&for=rent" className="block px-4 py-2 rounded-lg hover:bg-gray-50">
                          Rent
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <Link to="/about" className={isActive("/about") ? activeClass : baseLinkClass}>About</Link>
            <Link to="/services" className={isActive("/services") ? activeClass : baseLinkClass}>Services</Link>
            <Link to="/blog" className={isActive("/blog") ? activeClass : baseLinkClass}>Blog</Link>
            <Link to="/contact" className={isActive("/contact") ? activeClass : baseLinkClass}>Contact</Link>

            <a
              href="tel:+919920214015"
              className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700"
            >
              📞 Call Now
            </a>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden mr-2 rounded-lg bg-white/70 px-3 py-2"
            onClick={() => setMobileOpen((s) => !s)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-200 z-[400]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-gray-900">
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/new-launch" onClick={() => setMobileOpen(false)}>New Launch</Link>

            <Link to="/properties?segment=residential&for=resale" onClick={() => setMobileOpen(false)}>Residential — Buy</Link>
            <Link to="/properties?segment=residential&for=rent" onClick={() => setMobileOpen(false)}>Residential — Rent</Link>
            <Link to="/properties?segment=commercial&for=resale" onClick={() => setMobileOpen(false)}>Commercial — Buy</Link>
            <Link to="/properties?segment=commercial&for=rent" onClick={() => setMobileOpen(false)}>Commercial — Rent</Link>

            <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/services" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>

            <a
              href="tel:+919920214015"
              className="mt-2 inline-flex w-max items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold"
            >
              📞 Call Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
