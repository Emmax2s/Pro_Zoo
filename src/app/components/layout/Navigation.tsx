import { Link, useLocation } from "react-router";
import { Menu, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logoZoomat from "../../../assets/logo-zoomat.png";

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
    <nav className="bg-white/95 backdrop-blur-md border-b border-emerald-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-28 md:h-32">
          {/* Logo Oficial ZooMAT (Enlarged) */}
          <Link to="/" className="flex items-center gap-4 hover:opacity-95 transition group">
            <img
              src={logoZoomat}
              alt="Logo Oficial ZooMAT"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-contain bg-white p-1.5 shadow-xl border-3 border-emerald-300 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="font-black text-3xl md:text-4xl tracking-tight text-emerald-950 leading-none">
                ZooMAT
              </div>
              <div className="text-xs md:text-sm text-emerald-800 font-extrabold tracking-wider uppercase mt-1">
                Miguel Álvarez del Toro
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-9">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-base lg:text-lg font-bold transition-all relative py-2.5 ${
                  isActive(link.to)
                    ? "text-emerald-900"
                    : "text-gray-700 hover:text-emerald-700"
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full shadow-xs"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Info & Language Selector Desktop */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 shadow-xs">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Mar-Dom: 8:30 - 16:30</span>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-sm font-black text-emerald-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-300 px-4 py-2 rounded-full transition-all shadow-md cursor-pointer hover:scale-105"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-4 h-4 text-emerald-950" />
              <span>{i18n.language === 'es' ? 'ESPAÑOL (ES)' : 'ENGLISH (EN)'}</span>
            </button>
          </div>

          {/* Mobile Menu Button & Language Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2.5 text-emerald-950 bg-amber-100 hover:bg-amber-200 rounded-xl transition border border-amber-300 flex items-center gap-1.5 text-sm font-bold shadow-xs"
            >
              <Globe className="w-4 h-4 text-amber-800" />
              <span>{i18n.language === 'es' ? 'ES' : 'EN'}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-emerald-900 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-emerald-200 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-xl px-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-5 py-3.5 rounded-xl transition text-base font-bold mb-1.5 ${
                  isActive(link.to)
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-800 hover:bg-emerald-50 hover:text-emerald-900"
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
