import { Link, useLocation } from "react-router";
import { Menu, X, Clock, Globe, Compass, BookOpen, HelpCircle, MapPin, DollarSign, Facebook, Twitter, Youtube, Instagram, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logoZoomat from "../../../assets/logo-zoomat.png";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
  };

  const isEs = i18n.language === "es";

  const topLinks = [
    { to: "/visita", label: isEs ? "Acerca del zoológico" : "About the Zoo", icon: Compass },
    { to: "/visita#servicios", label: isEs ? "Servicios" : "Services", icon: Sparkles },
    { to: "/mapa", label: isEs ? "Mapa del zoológico" : "Zoo Map", icon: MapPin },
    { to: "/animales", label: isEs ? "Todo sobre animales" : "All about Animals", icon: BookOpen },
    { to: "/contacto", label: isEs ? "Preguntas frecuentes" : "FAQ & Help", icon: HelpCircle },
  ];

  const mainLinks = [
    { to: "/", label: isEs ? "INICIO" : "HOME" },
    { to: "/#atracciones", label: isEs ? "ATRACCIONES" : "ATTRACTIONS" },
    { to: "/#paquetes", label: isEs ? "PAQUETES" : "PACKAGES" },
    { to: "/animales", label: isEs ? "ANIMALES" : "ANIMALS" },
    { to: "/#ninos", label: isEs ? "NIÑOS" : "KIDS" },
    { to: "/mapa", label: isEs ? "MAPA" : "MAP" },
    { to: "/contacto", label: isEs ? "CONTACTO" : "CONTACT" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" && !location.hash;
    if (path.startsWith("/#")) return location.pathname === "/" && location.hash === path.replace("/", "");
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 shadow-2xl select-none">
      {/* 1. TOP DARK BARK / UTILITY STRIP (Photo 1 Style) */}
      <div className="bg-stone-950 text-stone-200 border-b border-stone-800 text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Top category navigation */}
          <div className="hidden md:flex items-center gap-6 overflow-x-auto py-0.5">
            {topLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 font-medium transition-colors whitespace-nowrap"
              >
                <item.icon className="w-3.5 h-3.5 text-amber-500/90" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right utility items: Admin link & Language Switcher */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 ml-auto">
            <span className="hidden sm:inline-block text-stone-400 text-xs">
              🍃 {isEs ? "Parque Natural & Reserva Ecológica" : "Natural Park & Ecological Reserve"}
            </span>

            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="flex items-center gap-1 text-xs font-bold text-amber-300/80 hover:text-amber-300 bg-stone-900 px-2.5 py-1 rounded-md border border-stone-700 hover:border-amber-500/50 transition-colors"
                title="Panel de Administración (Subir fotos y editar contenido)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-xs font-bold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md border border-stone-700 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEs ? "ES" : "EN"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN RUSTIC WOOD PLANK HEADER BAR (Photo 1 Signature Style) */}
      <div className="wood-texture-bg border-b-4 border-[#2b1706] shadow-xl relative overflow-visible">
        {/* Subtle top/bottom glossy bevel overlays */}
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-200/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 relative">
          <div className="flex items-center justify-between min-h-[96px] md:min-h-[110px] py-2 gap-2">

            {/* LEFT: HANGING PARCHMENT PAPER SIGN WITH LOGO */}
            <div className="relative z-20 flex-shrink-0 pt-1 -mb-6 md:-mb-8">
              {/* Hanging string nails */}
              <div className="flex justify-between w-28 md:w-36 px-4 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-stone-400 shadow-md inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-stone-400 shadow-md inline-block" />
              </div>

              {/* Parchment Tag */}
              <Link
                to="/"
                className="block w-28 md:w-36 bg-[#fcf8ec] text-stone-900 rounded-b-xl rounded-t-sm px-2.5 pt-2 pb-3 shadow-2xl border-2 border-[#d9c49e] relative group hover:-translate-y-0.5 transition-transform duration-200"
                style={{
                  backgroundImage: "radial-gradient(#dfd5bc 0.75px, transparent 0.75px)",
                  backgroundSize: "8px 8px",
                }}
              >
                {/* Paper dog-ear corner effect */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-tl from-amber-200 to-transparent rounded-tl shadow-inner pointer-events-none" />

                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={logoZoomat}
                      alt="Logo Zoológico"
                      className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-full border border-amber-900/30 p-0.5 bg-white shadow-md group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="mt-1 font-adventure text-lg md:text-xl text-amber-900 leading-none tracking-tight">
                    ZOO GDL
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-800 tracking-wider uppercase mt-0.5">
                    Dejando Huella
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: OPERATIONAL BADGE & MAIN ADVENTURE NAVIGATION */}
            <div className="flex-1 flex flex-col items-center justify-center px-2">
              {/* Horario y Teléfono pill */}
              <div className="hidden lg:flex items-center gap-3 bg-black/45 backdrop-blur-md px-4 py-1 rounded-full border border-amber-200/25 text-white text-xs font-semibold shadow-md mb-1.5">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isEs ? "Horario: Lun. a dom. de 9:00 a 17:00" : "Hours: Mon to Sun 9:00 - 17:00"}</span>
                </div>
                <span className="text-amber-200/50">|</span>
                <div className="flex items-center gap-1.5 text-stone-100">
                  <span>{isEs ? "Llámanos:" : "Call us:"}</span>
                  <a href="tel:+529616144700" className="text-amber-300 font-bold hover:underline">
                    (961) 614-4700
                  </a>
                </div>
              </div>

              {/* Main Adventure Nav Tabs (Desktop) */}
              <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
                {mainLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-adventure text-base lg:text-lg xl:text-xl px-2.5 py-1 rounded-lg transition-all tracking-wide ${
                      isActive(link.to)
                        ? "text-amber-300 text-adventure-shadow scale-105 bg-black/30 border border-amber-400/40"
                        : "text-white text-wood-carved hover:text-amber-300 hover:scale-105"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* RIGHT: HANGING "$ PRECIOS" WOOD SIGN & WOODEN SOCIAL COINS */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Hanging Wooden Sign for $ PRECIOS */}
              <div className="relative pt-1 flex flex-col items-center">
                {/* 2 Ropes */}
                <div className="flex justify-between w-16 md:w-24 px-2 -mb-0.5">
                  <span className="w-1 h-3 bg-gradient-to-b from-amber-900 to-amber-700 shadow-sm" />
                  <span className="w-1 h-3 bg-gradient-to-b from-amber-900 to-amber-700 shadow-sm" />
                </div>

                <Link
                  to="/#paquetes"
                  className="wood-texture-dark px-3 md:px-4 py-1.5 md:py-2 rounded-xl border-2 border-amber-600/70 shadow-2xl flex items-center gap-1.5 text-amber-300 font-adventure text-sm md:text-base tracking-wide hover:scale-105 hover:border-amber-400 transition-all wood-button-shadow cursor-pointer group"
                >
                  <DollarSign className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-white text-adventure-shadow font-adventure">
                    {isEs ? "PRECIOS" : "PRICES"}
                  </span>
                </Link>
              </div>

              {/* Hanging Wood Coins for Social Networks */}
              <div className="hidden xl:flex items-center gap-2 pt-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="w-8 h-8 rounded-full wood-texture-dark border border-amber-600/60 flex items-center justify-center text-amber-200 hover:text-white hover:scale-110 transition-transform shadow-md"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Twitter / X"
                  className="w-8 h-8 rounded-full wood-texture-dark border border-amber-600/60 flex items-center justify-center text-amber-200 hover:text-white hover:scale-110 transition-transform shadow-md"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  className="w-8 h-8 rounded-full wood-texture-dark border border-amber-600/60 flex items-center justify-center text-amber-200 hover:text-white hover:scale-110 transition-transform shadow-md"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="w-8 h-8 rounded-full wood-texture-dark border border-amber-600/60 flex items-center justify-center text-amber-200 hover:text-white hover:scale-110 transition-transform shadow-md"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>

              {/* Mobile menu toggle button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl wood-texture-dark border border-amber-600 text-amber-300 hover:text-white shadow-lg"
                aria-label="Abrir menú"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu with rustic wood theme */}
        {isOpen && (
          <div className="md:hidden wood-texture-dark border-t-2 border-amber-800/80 px-4 py-4 space-y-2 backdrop-blur-md shadow-2xl">
            {mainLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl font-adventure text-lg tracking-wider transition ${
                  isActive(link.to)
                    ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                    : "text-stone-200 hover:bg-black/30 hover:text-amber-300"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-amber-900/60 flex items-center justify-between text-xs text-stone-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Clock className="w-3.5 h-3.5" /> 9:00 - 17:00
              </span>
              <a href="tel:+529616144700" className="font-bold text-amber-300">
                (961) 614-4700
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

