import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import headerLogo from '../assets/logo-zoomat.png';
import { useLanguage } from '../contexts/LanguageContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t.navbar.home, href: '/' },
    { name: t.navbar.animals, href: '/animales' },
    { name: t.navbar.info, href: '/info' },
    { name: t.navbar.contact, href: '/contacto' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={headerLogo} alt="Zoomat Logo" className="h-12 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>{t.navbar.languageLabel}:</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'es' | 'en')}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                aria-label={t.navbar.languageLabel}
              >
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <span>{t.navbar.languageLabel}:</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as 'es' | 'en')}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                  aria-label={t.navbar.languageLabel}
                >
                  <option value="es">Espanol</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
