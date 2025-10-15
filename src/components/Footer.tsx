import { Phone, Mail, MapPin, Facebook, Twitter, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src="/Sahai Estates 131.png"
              alt="Sahai Estates"
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Your trusted partner for premium luxury real estate in South Mumbai.
              Specializing in sea-facing apartments and exclusive properties.
            </p>
            <p className="text-xs text-gray-400">
              RERA No: A51900001512
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Properties', 'About', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate(item.toLowerCase())}
                    className="text-gray-300 hover:text-brand-500 transition-colors text-sm"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

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

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/sahaiestates/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/sahaiestates131"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="http://www.sahaiestates.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"
              >
                <Globe size={20} />
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
