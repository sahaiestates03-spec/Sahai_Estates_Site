import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Properties', id: 'properties' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-3" onClick={() => onNavigate('home')}>
            <img
              src="/Sahai Estates 131.png"
              alt="Sahai Estates"
              className="h-12 w-auto"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-brand-600 border-b-2 border-brand-600'
                    : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                {item.name}
              </button>
            ))}
            <a
              href="tel:+919920214015"
              className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2.5 rounded-md hover:bg-navy-800 transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm font-medium">Call Now</span>
            </a>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md ${
                  currentPage === item.id
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            <a
              href="tel:+919920214015"
              className="flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-md hover:bg-navy-800 transition-colors mt-4"
            >
              <Phone size={16} />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
