import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Properties', to: '/properties' },
    { label: 'About', to: '/about' },
    { label: 'Services', to: '/services' },
    { label: 'Contact', to: '/contact' },
    { label: 'Blog', to: '/blog' },
  ] as const;

  // Social links (X + Website removed)
  const SOCIALS = {
    facebook: 'https://www.facebook.com/sahaiestates/',
    linkedin: 'https://www.linkedin.com/company/sahai-estates/',
    instagram: 'https://www.instagram.com/sahai_estates/?igsh=NGt6am96bmN2cjl4#',
    youtube: 'https://www.youtube.com/@sahaiestates4075',
  } as const;

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
  <img
    src="/Sahai Estates 131.png"
    alt="Sahai Estates"
    className="h-14 w-auto mb-4 bg-white rounded-lg p-2 shadow-md"
  />
  {/* darken text so it doesn't look washed out next to the brighter logo */}
  <p className="text-gray-400 text-sm leading-relaxed mb-3">
    Your trusted partner for premium luxury real estate in South Mumbai.
    Specializing in sea-facing apartments and exclusive properties.
  </p>
  <p className="text-xs text-gray-500">RERA No: A51900001512</p>
</div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-gray-300 hover:text-brand-500 transition-colors text-sm"
                    aria-label={`Go to ${label}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-1 text-brand-500" />
                <div className="text-gray-300 text-sm">
                  <a href="tel:+919920214015" className="hover:text-brand-500 transition-colors block">
                    +91 99202 14015
                  </a>
                  <a href="tel:+912223522092" className="hover:text-brand-500 transition-colors block">
                    +91 022 2352 2092
                  </a>
                  <a href="tel:+912223513703" className="hover:text-brand-500 transition-colors block">
                    +91 022 2351 3703
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-1 text-brand-500" />
                <div className="text-gray-300 text-sm">
                  <a href="mailto:sahaiestates@yahoo.co.in" className="hover:text-brand-500 transition-colors block">
                    sahaiestates@yahoo.co.in
                  </a>
                  <a href="mailto:sahaiestates@gmail.com" className="hover:text-brand-500 transition-colors block">
                    sahaiestates@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-brand-500" />
                <span className="text-gray-300 text-sm">
                  #131, 1st Floor, Arun Chamber,<br />Tardeo, Mumbai - 400034
                </span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Facebook"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href={SOCIALS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open LinkedIn"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Instagram"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open YouTube"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            © 2025 Sahai Estates. All rights reserved. | RERA No: A51900001512
          </p>
          <p className="text-gray-500 text-xs">
            Member of SMART (South Metro City Association of Realtors) | Member of NAR India
          </p>
        </div>
      </div>
    </footer>
  );
}
