{/* Desktop nav */}
<div className="hidden md:flex items-center gap-1">
  <NavLink to="/" className={linkClasses}>Home</NavLink>
  <NavLink to="/properties" className={linkClasses}>Properties</NavLink>
  <NavLink to="/about" className={linkClasses}>About</NavLink>
  <NavLink to="/services" className={linkClasses}>Services</NavLink>
  <NavLink to="/blog" className={linkClasses}>Blog</NavLink> {/* ✅ Added */}
  <NavLink to="/contact" className={linkClasses}>Contact</NavLink>

  <a
    href="tel:+919920214015"
    className="ml-3 inline-flex items-center rounded-md bg-navy-900 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-600"
  >
    📞 Call Now
  </a>
</div>

{/* Mobile menu */}
{open && (
  <div className="md:hidden border-t border-gray-200 bg-white">
    <div className="px-4 py-3 space-y-1">
      <NavLink to="/" className={linkClasses} onClick={() => setOpen(false)}>Home</NavLink>
      <NavLink to="/properties" className={linkClasses} onClick={() => setOpen(false)}>Properties</NavLink>
      <NavLink to="/about" className={linkClasses} onClick={() => setOpen(false)}>About</NavLink>
      <NavLink to="/services" className={linkClasses} onClick={() => setOpen(false)}>Services</NavLink>
      <NavLink to="/blog" className={linkClasses} onClick={() => setOpen(false)}>Blog</NavLink> {/* ✅ Added */}
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
