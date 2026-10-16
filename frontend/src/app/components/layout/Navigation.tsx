import { Link, useLocation } from "react-router";
import { Menu, X, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { useZoo } from "../../context/ZooContext";
import logoZoomat from "../../../assets/logo-zoomat.png";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentLang, toggleLanguage } = useZoo();

  const isEs = currentLang === "es";

  const mainLinks = [
    { to: "/", label: isEs ? "INICIO" : "HOME" },
    { to: "/animales", label: isEs ? "ANIMALES" : "ANIMALS" },
    { to: "/visita", label: isEs ? "VISITA" : "VISIT" },
    { to: "/mapa", label: isEs ? "MAPA" : "MAP" },
    { to: "/contacto", label: isEs ? "CONTACTO" : "CONTACT" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 shadow-2xl select-none">

      {/* 2. MAIN RUSTIC WOOD PLANK HEADER BAR (Photo 1 Signature Style) */}
      <div className="wood-texture-bg border-b-4 border-[#2b1706] shadow-xl relative overflow-visible">
        {/* Subtle top/bottom glossy bevel overlays */}
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-200/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 relative">
          <div className="flex items-center justify-between min-h-[78px] md:min-h-[88px] py-1.5 gap-2">

            {/* LEFT: HANGING PARCHMENT PAPER SIGN WITH LOGO */}
            <div className="relative z-20 flex-shrink-0 pt-0.5 -mb-6 md:-mb-8">
              {/* Hanging string nails */}
              <div className="flex justify-between w-28 sm:w-32 md:w-36 px-4 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-stone-400 shadow-md inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-stone-400 shadow-md inline-block" />
              </div>

              {/* White Card Tag */}
              <Link
                to="/"
                className="block w-28 sm:w-32 md:w-36 bg-white text-stone-900 rounded-b-2xl rounded-t-sm p-1.5 pb-2 shadow-2xl border-2 border-stone-200 relative group hover:-translate-y-0.5 transition-transform duration-200"
              >
                {/* Paper dog-ear corner effect */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-tl from-amber-200/60 to-transparent rounded-tl shadow-inner pointer-events-none" />

                <div className="flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={logoZoomat}
                      alt="Logo Oficial ZooMAT"
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform bg-white"
                    />
                  </div>
                  <div className="mt-1 font-adventure text-base sm:text-lg md:text-xl text-stone-900 leading-none tracking-tight">
                    ZooMAT
                  </div>
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-emerald-800 tracking-wider uppercase mt-1 leading-tight">
                    Miguel Álvarez del Toro
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: OPERATIONAL BADGE & MAIN ADVENTURE NAVIGATION */}
            <div className="flex-1 flex flex-col items-center justify-center px-2">
              {/* Horario y Teléfono pill */}
              <div className="hidden lg:flex items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-0.5 rounded-full border border-amber-200/25 text-white text-[11px] font-semibold shadow-md mb-1.5">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isEs ? "Horario: Mar-Dom: 8:30 - 16:30" : "Hours: Tue-Sun 8:30 - 16:30"}</span>
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
              <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-5">
                {mainLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-adventure text-base lg:text-lg xl:text-xl px-2.5 py-1 rounded-xl transition-all tracking-wide ${
                      isActive(link.to)
                        ? "text-amber-300 text-adventure-shadow scale-105 bg-black/35 border border-amber-400/40 shadow-md"
                        : "text-white text-wood-carved hover:text-amber-300 hover:scale-105"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* RIGHT: LANGUAGE SWITCHER & MOBILE MENU */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
              {/* Botón de Idioma colgante de madera (donde apuntó la flecha) */}
              <div className="relative pt-1 flex flex-col items-center">
                {/* 2 Ropes */}
                <div className="flex justify-between w-12 sm:w-16 px-1.5 -mb-0.5">
                  <span className="w-1 h-3 bg-gradient-to-b from-amber-900 to-amber-700 shadow-sm" />
                  <span className="w-1 h-3 bg-gradient-to-b from-amber-900 to-amber-700 shadow-sm" />
                </div>

                <button
                  onClick={toggleLanguage}
                  className="wood-texture-dark px-2 sm:px-3 py-1 md:py-1.5 rounded-xl border-2 border-amber-600/70 shadow-2xl flex items-center gap-1.5 text-amber-300 font-adventure text-xs md:text-sm tracking-wide hover:scale-105 hover:border-amber-400 transition-all wood-button-shadow cursor-pointer group"
                  title={isEs ? "Switch language to English" : "Cambiar idioma a Español"}
                  aria-label="Cambiar idioma / Switch language"
                >
                  <Globe className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="text-white text-adventure-shadow font-adventure font-bold">
                    {isEs ? "ES" : "EN"}
                  </span>
                </button>
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
