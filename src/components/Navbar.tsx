import { Menu, X } from 'lucide-react';
import { useState } from 'react';
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
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-full mx-auto px-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold tracking-wide">
              <span className="text-emerald-900">ZOO</span>
              <span className="text-emerald-600">AVENTURAS</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-emerald-700 font-medium transition-colors"
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
                  className="text-gray-600 hover:text-emerald-700 transition-colors"
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
