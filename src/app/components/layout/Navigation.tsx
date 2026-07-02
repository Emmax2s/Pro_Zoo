import { Link, useLocation } from "react-router";
import { Menu, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/animales", label: t("nav.animals") },
    { to: "/visita", label: t("nav.visit") },
    { to: "/mapa", label: t("nav.map") },
    { to: "/contacto", label: t("nav.contact") },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <div className="bg-emerald-800 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              Z
            </div>
            <div>
              <div className="font-semibold text-lg tracking-tight text-emerald-950">ZooMAT</div>
              <div className="text-[10px] text-emerald-600 uppercase tracking-widest font-medium">Chiapas</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors relative py-2 ${
                  isActive(link.to)
                    ? "text-emerald-800"
                    : "text-gray-500 hover:text-emerald-700"
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Info Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Clock className="w-3.5 h-3.5" />
              <span>9:00 - 17:00</span>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{i18n.language === 'es' ? 'EN' : 'ES'}</span>
            </button>
          </div>

          {/* Mobile Menu Button & Language Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition border border-emerald-100 flex items-center gap-1 text-xs font-bold"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'es' ? 'EN' : 'ES'}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-emerald-100">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg transition text-sm mb-1 ${
                  isActive(link.to)
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
