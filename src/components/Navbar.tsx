import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // dropdown states
  const [propOpen, setPropOpen] = useState(false);
  const [subOpen, setSubOpen] = useState<"res" | "com" | null>(null);

  // hover-intent timers
  const propOpenTimer = useRef<number | null>(null);
  const propCloseTimer = useRef<number | null>(null);
  const subOpenTimer = useRef<number | null>(null);
  const subCloseTimer = useRef<number | null>(null);

  const OPEN_DELAY = 120;   // ms (feel free to tweak 120–180)
  const CLOSE_DELAY = 240;  // ms (close a bit slower)

  function clearTimer(ref: React.MutableRefObject<number | null>) {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  }

  // ---- PROPERTIES (root) handlers ----
  const onPropEnter = () => {
    clearTimer(propCloseTimer);
    if (!propOpen) {
      clearTimer(propOpenTimer);
      propOpenTimer.current = window.setTimeout(() => setPropOpen(true), OPEN_DELAY);
    }
  };
  const onPropLeave = () => {
    clearTimer(propOpenTimer);
    clearTimer(subOpenTimer);
    // close after delay so cursor can travel
    propCloseTimer.current = window.setTimeout(() => {
      setPropOpen(false);
      setSubOpen(null);
    }, CLOSE_DELAY);
  };

  // ---- SUBMENU handlers (Residential/Commercial) ----
  const onSubEnter = (which: "res" | "com") => {
    clearTimer(subCloseTimer);
    if (subOpen !== which) {
      clearTimer(subOpenTimer);
      subOpenTimer.current = window.setTimeout(() => setSubOpen(which), OPEN_DELAY);
    }
  };
  const onSubLeave = (which: "res" | "com") => {
    clearTimer(subOpenTimer);
    subCloseTimer.current = window.setTimeout(() => {
      // only close if the same submenu was open
      setSubOpen((s) => (s === which ? null : s));
    }, CLOSE_DELAY);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 ml-4 md:ml-8 lg:ml-12" aria-label="Sahai Estates - Home">
            <img
              src="/logo.png"
              alt="Sahai Estates"
              className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
            <span className="sr-only">Sahai Estates</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-gray-900">
            <Link to="/" className="hover:text-brand-600 font-medium">Home</Link>
            <Link to="/#new-launch" className="hover:text-brand-600 font-medium">New Launch</Link>



            {/* PROPERTIES (2-level, with delays) */}
            <div
              className="relative"
              onMouseEnter={onPropEnter}
              onMouseLeave={onPropLeave}
            >
              <button
                type="button"
                onClick={() => setPropOpen((v) => !v)}
                className="hover:text-brand-600 font-medium inline-flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={propOpen}
              >
                Properties <span aria-hidden>▾</span>
              </button>

              {propOpen && (
                <div
                  className="absolute left-0 top-full mt-2 min-w-64 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[300]"
                  role="menu"
                >
                  {/* Residential trigger */}
                  <div
                    className="relative"
                    onMouseEnter={() => onSubEnter("res")}
                    onMouseLeave={() => onSubLeave("res")}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center justify-between"
                      onClick={() => setSubOpen((s) => (s === "res" ? null : "res"))}
                      aria-haspopup="menu"
                      aria-expanded={subOpen === "res"}
                    >
                      <span>Residential</span>
                      <span aria-hidden>▸</span>
                    </button>

                    {/* Residential submenu */}
                    {subOpen === "res" && (
                      <div
                        className="absolute left-full top-0 ml-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[320]"
                        role="menu"
                      >
                        <Link
                          to="/properties?segment=residential&for=resale"
                          className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                          role="menuitem"
                        >
                          Buy (Sale)
                        </Link>
                        <Link
                          to="/properties?segment=residential&for=rent"
                          className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                          role="menuitem"
                        >
                          Rent
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Commercial trigger */}
                  <div
                    className="relative"
                    onMouseEnter={() => onSubEnter("com")}
                    onMouseLeave={() => onSubLeave("com")}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center justify-between"
                      onClick={() => setSubOpen((s) => (s === "com" ? null : "com"))}
                      aria-haspopup="menu"
                      aria-expanded={subOpen === "com"}
                    >
                      <span>Commercial</span>
                      <span aria-hidden>▸</span>
                    </button>

                    {/* Commercial submenu */}
                    {subOpen === "com" && (
                      <div
                        className="absolute left-full top-0 ml-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-lg p-2 z-[320]"
                        role="menu"
                      >
                        <Link
                          to="/properties?segment=commercial&for=resale"
                          className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                          role="menuitem"
                        >
                          Buy (Sale)
                        </Link>
                        <Link
                          to="/properties?segment=commercial&for=rent"
                          className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                          role="menuitem"
                        >
                          Rent
                        </Link>
                      </div>
                    )}
                  </div>

                  
                </div>
              )}
            </div>

            <Link to="/about" className="hover:text-brand-600 font-medium">About</Link>
            <Link to="/services" className="hover:text-brand-600 font-medium">Services</Link>
            <Link to="/blog" className="hover:text-brand-600 font-medium">Blog</Link>
            <Link to="/contact" className="hover:text-brand-600 font-medium">Contact</Link>

            <a
              href="tel:+919920214015"
              className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
            >
              📞 Call Now
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden mr-2 rounded-lg bg-white/70 px-3 py-2"
            onClick={() => setMobileOpen(s => !s)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (simple list) */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-200 z-[250]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-gray-900">
            <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">Home</Link>
            <Link to="/properties?segment=residential&for=resale" onClick={() => setMobileOpen(false)} className="py-2">Residential — Buy</Link>
            <Link to="/properties?segment=residential&for=rent" onClick={() => setMobileOpen(false)} className="py-2">Residential — Rent</Link>
            <Link to="/properties?segment=commercial&for=resale" onClick={() => setMobileOpen(false)} className="py-2">Commercial — Buy</Link>
            <Link to="/properties?segment=commercial&for=rent" onClick={() => setMobileOpen(false)} className="py-2">Commercial — Rent</Link>
            <Link to="/properties?for=under-construction&segment=residential" onClick={() => setMobileOpen(false)} className="py-2">New Launch</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="py-2">About</Link>
            <Link to="/services" onClick={() => setMobileOpen(false)} className="py-2">Services</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)} className="py-2">Blog</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-2">Contact</Link>
            <a href="tel:+919920214015" className="mt-2 inline-flex w-max items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold">
              📞 Call Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
