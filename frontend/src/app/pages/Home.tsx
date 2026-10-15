import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { 
  ArrowRight, Users, Heart, TreePine, Calendar, MapPin, Ticket, Clock, 
  Shield, BookOpen, ChevronLeft, ChevronRight, Play, Sparkles, DollarSign, 
  Camera, Compass, Award, Star, Volume2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useZoo } from "../context/ZooContext";

// ── Hero Carousel with Adventure Safari Style ────────────────────────────────
function HeroCarousel() {
  const { slides } = useZoo();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = slides.length;

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c + 1) % total);
    setPlaying(false);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c - 1 + total) % total);
    setPlaying(false);
  }, [total]);

  useEffect(() => {
    if (total === 0 || !slides[current] || slides[current].type === "video") return;
    const id = setTimeout(next, 5000);
    return () => clearTimeout(id);
  }, [current, next, slides, total]);

  if (total === 0) {
    return (
      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-amber-200 font-adventure text-2xl">
        Cargando atracciones del zoológico...
      </div>
    );
  }

  const slide = slides[current];

  // Pick up to 3 polaroids from slides to show in foreground
  const polaroidIndices = [
    (current + 1) % total,
    (current + 2) % total,
    (current + 3) % total,
  ].filter((idx, pos, arr) => arr.indexOf(idx) === pos && idx !== current);

  return (
    <div className="w-full h-full relative group bg-stone-950 overflow-hidden select-none">
      {/* Background slide */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {s.type === "image" ? (
            <div className="w-full h-full relative bg-stone-900 flex items-center justify-center overflow-hidden">
              <img
                src={s.src}
                alt={s.alt || "Zoológico"}
                className="w-full h-full object-cover object-center select-none scale-100 transition-transform duration-1000 group-hover:scale-105"
              />
              {/* Cinematic Vignette & Sunlit Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full relative bg-stone-950">
              <video
                src={s.src}
                poster={s.poster}
                className="w-full h-full object-cover object-center"
                loop
                playsInline
                ref={(el) => {
                  if (!el) return;
                  if (i === current && playing) el.play();
                  else el.pause();
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40 pointer-events-none" />
              {!playing && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors z-20 cursor-pointer"
                >
                  <span className="w-20 h-20 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform wood-button-shadow">
                    <Play size={36} className="ml-1 fill-stone-950" />
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* ADVENTURE HERO OVERLAYS (Photo 1 "VEN A MONKEYLAND" Style) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-8 md:p-12">
        {/* Top bar over hero: Badge & Counter */}
        <div className="flex items-center justify-between w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="tracking-wider uppercase">
              {slide.alt ? slide.alt : "Gran Reserva Natural"}
            </span>
          </div>

          {/* Counter pill (Photo 1 Style: 01 / 04) */}
          <div className="bg-black/60 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl tracking-wider">
            {String(current + 1).padStart(2, "0")}{" "}
            <span className="text-amber-300/80">/ {String(total).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Center / Right adventure headline inspired by photo */}
        <div className="my-auto max-w-2xl self-end text-right pr-2 sm:pr-6 pointer-events-auto">
          <div className="font-adventure text-white text-2xl sm:text-4xl lg:text-5xl tracking-wider text-adventure-shadow">
            ¡VEN A VIVIR LA AVENTURA!
          </div>
          <div className="font-adventure text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-amber-400 text-adventure-orange leading-tight drop-shadow-2xl">
            MONKEYLAND
          </div>
          <p className="text-white/95 text-sm sm:text-lg font-bold drop-shadow-md max-w-lg ml-auto mt-2">
            Descubre primates en libertad, fauna nativa y la mayor reserva de biodiversidad en Chiapas.
          </p>

          <div className="flex items-center justify-end gap-3 mt-4">
            <a
              href="#paquetes"
              className="inline-flex items-center gap-2 wood-texture-bg text-amber-200 border-2 border-amber-500/80 font-adventure text-base sm:text-lg px-5 py-2.5 rounded-xl shadow-2xl hover:scale-105 hover:text-white transition-all wood-button-shadow"
            >
              <Ticket className="w-5 h-5 text-amber-400" />
              <span>Ver Boletos</span>
            </a>
            <a
              href="#atracciones"
              className="inline-flex items-center gap-2 bg-emerald-700/90 hover:bg-emerald-600 text-white border-2 border-emerald-400/60 font-adventure text-base sm:text-lg px-5 py-2.5 rounded-xl shadow-2xl hover:scale-105 transition-all"
            >
              <span>Atracciones</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* BOTTOM INTERACTIVE POLAROIDS (Photo 1 Signature Feature) */}
        <div className="w-full flex items-end justify-between gap-4 pointer-events-auto">
          {/* Left badge */}
          <div className="hidden lg:flex items-center gap-2 bg-stone-900/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/30 text-amber-200 shadow-xl">
            <TreePine className="w-5 h-5 text-emerald-400" />
            <div className="text-xs">
              <span className="font-black block text-white">Fauna 100% Protegida</span>
              <span>100 hectáreas de reserva natural</span>
            </div>
          </div>

          {/* Polaroid Cards row resting on the bottom frame */}
          <div className="flex items-end justify-center lg:justify-end gap-3 sm:gap-4 overflow-visible pb-1 sm:pb-2 mx-auto lg:mx-0">
            {polaroidIndices.map((idx, pos) => {
              const item = slides[idx];
              if (!item) return null;
              const rotation = pos === 0 ? "-rotate-3" : pos === 1 ? "rotate-2" : "-rotate-2";
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrent(idx);
                    setPlaying(false);
                  }}
                  title={`Ver slide: ${item.alt || idx + 1}`}
                  className={`polaroid-frame ${rotation} w-28 sm:w-36 md:w-44 rounded cursor-pointer transform hover:scale-110 transition-all duration-300 text-left`}
                >
                  <div className="w-full h-20 sm:h-24 md:h-28 overflow-hidden bg-stone-800 rounded-xs mb-1.5">
                    <img
                      src={item.src}
                      alt={item.alt || "Momento del Zoológico"}
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-stone-800 truncate text-center">
                    {item.alt ? item.alt : `Foto #${idx + 1}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RUSTIC ROUND WOOD NAVIGATION BUTTONS (Left & Right) */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-2xl hover:scale-115 hover:border-amber-300 transition-all cursor-pointer wood-button-shadow"
        aria-label="Anterior atracción"
      >
        <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-2xl hover:scale-115 hover:border-amber-300 transition-all cursor-pointer wood-button-shadow"
        aria-label="Siguiente atracción"
      >
        <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-400/30 shadow-lg">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setPlaying(false);
            }}
            className={`rounded-full transition-all cursor-pointer ${
              i === current ? "w-6 h-2.5 bg-amber-400" : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export function Home() {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === "es";
  const { animals } = useZoo();

  const attractions = [
    {
      title: "Monkeyland & Primates",
      tag: "Zona Interactiva",
      desc: "Conoce a los monos araña y monos aulladores en su hábitat arbóreo enriquecido con puentes colgantes.",
      icon: "🐒",
      badge: "Favorito Familiar",
      img: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Tierra de Jaguares",
      tag: "Reserva de Felinos",
      desc: "El santuario natural del rey de la selva mexicana, jaguares y ocelotes en un entorno de selva húmeda protegida.",
      icon: "🐆",
      badge: "Especie Emblema",
      img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Aviario El Vuelo Tropical",
      tag: "Domo de Vuelo Libre",
      desc: "Camina bajo copas de árboles mientras guacamayas rojas, quetzales y tucanes vuelan a centímetros de ti.",
      icon: "🦜",
      badge: "Vuelo Libre",
      img: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Herpetario & Nocturnario",
      tag: "Mundo Oculto",
      desc: "Admira la mayor colección de reptiles, anfibios fascinantes y especies nocturnas de Mesoamérica.",
      icon: "🐍",
      badge: "Inmersivo",
      img: "https://images.unsplash.com/photo-1525869916826-97fe88508861?auto=format&fit=crop&q=80&w=600",
    },
  ];

  const packages = [
    {
      name: "Boleto Safari General",
      price: "$30",
      currency: "MXN",
      tag: "Acceso Básico",
      desc: "Perfecto para caminantes y amantes de la naturaleza que desean recorrer a pie todos los senderos.",
      highlight: false,
      features: [
        "Acceso a todo el circuito de exhibición",
        "Senderos botánicos y miradores",
        "Entrada libre a menores de 3 años",
        "Áreas de descanso y sombras naturales",
      ],
    },
    {
      name: "Paquete Safari Familiar",
      price: "$120",
      currency: "MXN",
      tag: "Más Recomendado",
      desc: "La experiencia completa para toda la familia con comodidades y recorrido guiado.",
      highlight: true,
      features: [
        "Entrada para 2 Adultos + 2 Niños",
        "Pase para el Tren Safari del zoológico",
        "Mapa ilustrado con rally de animales",
        "10% de descuento en cafetería y recuerdos",
        "Charla educativa con biólogos cuidadores",
      ],
    },
    {
      name: "Expedición Salvaje VIP",
      price: "$250",
      currency: "MXN",
      tag: "Experiencia Exclusiva",
      desc: "Acceso preferencial y recorrido especializado tras bambalinas guiado por veterinarios.",
      highlight: false,
      features: [
        "Recorrido VIP en grupo reducido (máx. 8)",
        "Acceso a la cocina de preparación de dietas",
        "Sesión de fotos con guacamayas y aves",
        "Souvenir oficial conmemorativo",
        "Aportación directa al fondo de conservación",
      ],
    },
  ];

  return (
    <div className="bg-[#fcfaf5] text-stone-900 min-h-screen">
      {/* 1. HERO CAROUSEL WITH ADVENTURE BANNER */}
      <section className="relative w-full overflow-hidden bg-stone-950">
        <div className="w-full h-[540px] sm:h-[620px] md:h-[700px] lg:h-[760px] relative">
          <HeroCarousel />
        </div>

        {/* BOTTOM RUSTIC WOOD PLANK BORDER (Signature Photo 1 Frame) */}
        <div className="wood-texture-bg h-7 sm:h-9 w-full border-t-2 border-b-4 border-[#2b1706] shadow-2xl relative z-30">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-200/30" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/50" />
        </div>
      </section>

      {/* 2. QUICK EXPLORER ACTION BAR */}
      <section className="bg-stone-900 text-stone-100 py-6 border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <span className="block text-xs text-stone-400 font-bold uppercase">Horario</span>
                <span className="font-bold text-sm text-stone-100">Mar - Dom: 9:00 - 17:00</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <Ticket className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <span className="block text-xs text-stone-400 font-bold uppercase">Entrada General</span>
                <span className="font-bold text-sm text-stone-100">$30 MXN por persona</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <span className="block text-xs text-stone-400 font-bold uppercase">Ubicación</span>
                <span className="font-bold text-sm text-stone-100">Cerro Hueco, Chiapas</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <TreePine className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="text-left">
                <span className="block text-xs text-stone-400 font-bold uppercase">Conservación</span>
                <span className="font-bold text-sm text-stone-100">50+ Especies Nativas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ATTRACTIONS SECTION (#atracciones) */}
      <section id="atracciones" className="py-20 md:py-24 relative overflow-hidden">
        {/* Subtle decorative leaf pattern */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>Explora el Zoológico</span>
            </div>
            <h2 className="font-adventure text-4xl sm:text-5xl md:text-6xl text-stone-900 tracking-wide text-adventure-shadow">
              ATRACCIONES PRINCIPALES
            </h2>
            <p className="text-stone-600 text-base sm:text-lg mt-3 font-medium">
              Vive un recorrido inmersivo a través de hábitats naturales diseñados para el bienestar de la fauna y el asombro de tu familia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((att, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden border-2 border-stone-200 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-52 overflow-hidden bg-stone-200">
                  <img
                    src={att.img}
                    alt={att.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-amber-400 text-stone-950 font-adventure text-xs px-3 py-1 rounded-full shadow-md">
                    {att.badge}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-stone-950/70 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-lg">
                    {att.tag}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-2">{att.icon}</div>
                    <h3 className="font-adventure text-2xl text-stone-900 mb-2">{att.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{att.desc}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-stone-100">
                    <Link
                      to="/animales"
                      className="inline-flex items-center gap-1.5 text-emerald-800 font-adventure text-sm hover:text-emerald-950 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Ver habitantes</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRECIOS Y PAQUETES SECTION (#paquetes - Target of "$ PRECIOS" button) */}
      <section id="paquetes" className="py-20 md:py-24 wood-texture-bg relative border-y-4 border-[#2b1706] text-white">
        <div className="absolute inset-0 bg-stone-950/75" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Hanging wood plaque header */}
            <div className="inline-block wood-texture-dark px-6 py-2 rounded-2xl border-2 border-amber-500 shadow-2xl mb-4">
              <span className="font-adventure text-amber-300 text-lg tracking-wider flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                BOLETOS Y TARIFAS
              </span>
            </div>
            <h2 className="font-adventure text-4xl sm:text-5xl md:text-6xl text-white tracking-wide text-adventure-shadow">
              PAQUETES Y PRECIOS
            </h2>
            <p className="text-stone-300 text-base sm:text-lg mt-3 font-medium">
              Tarifas accesibles para que toda la comunidad y visitantes disfruten de la naturaleza y educación ambiental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  pkg.highlight
                    ? "bg-[#fffdf7] text-stone-900 border-4 border-amber-400 shadow-2xl scale-105 z-10"
                    : "bg-stone-900/90 text-stone-100 border-2 border-amber-900/60 shadow-xl"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-adventure text-sm uppercase px-5 py-1 rounded-full shadow-lg border-2 border-white">
                    ⭐ {pkg.tag}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-adventure text-2xl ${pkg.highlight ? "text-stone-900" : "text-amber-300"}`}>
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={`font-adventure text-5xl sm:text-6xl ${pkg.highlight ? "text-emerald-800" : "text-white"}`}>
                      {pkg.price}
                    </span>
                    <span className={`font-bold text-sm ${pkg.highlight ? "text-stone-600" : "text-stone-400"}`}>
                      {pkg.currency}
                    </span>
                  </div>

                  <p className={`text-sm mb-6 ${pkg.highlight ? "text-stone-600" : "text-stone-300"}`}>
                    {pkg.desc}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-stone-200/40">
                    <span className={`text-xs font-black uppercase tracking-wider block ${pkg.highlight ? "text-stone-500" : "text-amber-400"}`}>
                      Incluye:
                    </span>
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5 text-sm">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6">
                  <Link
                    to="/visita"
                    className={`w-full py-3.5 px-6 rounded-2xl font-adventure text-lg text-center flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                      pkg.highlight
                        ? "bg-amber-500 hover:bg-amber-400 text-stone-950 wood-button-shadow"
                        : "bg-emerald-700 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <Ticket className="w-5 h-5" />
                    <span>Adquirir en Taquilla</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-stone-400 text-xs sm:text-sm">
            💡 <strong className="text-stone-200">Nota:</strong> Las taquillas operan de Martes a Domingo de 9:00 AM a 4:00 PM. Estudiantes y adultos mayores con credencial vigente reciben 50% de descuento.
          </div>
        </div>
      </section>

      {/* 5. FEATURED ANIMALS (From zooStore / Admin) */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
                <Heart className="w-4 h-4 text-emerald-700" />
                <span>Fauna de Chiapas</span>
              </div>
              <h2 className="font-adventure text-4xl sm:text-5xl text-stone-900 tracking-wide text-adventure-shadow">
                ESPECIES EMBLEMÁTICAS
              </h2>
              <p className="text-stone-600 max-w-2xl text-base sm:text-lg mt-2 font-medium">
                Conoce a los habitantes que protegemos y rehabilitamos en nuestra reserva ecológica.
              </p>
            </div>

            <Link
              to="/animales"
              className="inline-flex items-center gap-2 font-adventure text-base text-amber-900 bg-amber-300 hover:bg-amber-400 px-6 py-3 rounded-2xl border-2 border-amber-500 shadow-md hover:scale-105 transition-all"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {animals.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-amber-50/50 rounded-3xl border-2 border-dashed border-amber-300 p-8">
                <p className="text-stone-800 font-bold text-lg">No hay especies registradas actualmente.</p>
                <p className="text-stone-500 text-sm mt-1">Las especies agregadas desde el panel de administración aparecerán aquí.</p>
              </div>
            ) : (
              animals.slice(0, 3).map((animal) => (
                <div
                  key={animal.id}
                  className="bg-[#fcfbf7] rounded-3xl overflow-hidden border-2 border-stone-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-72 overflow-hidden bg-stone-900">
                    <img
                      src={animal.image}
                      alt={isEs ? animal.name : animal.nameEn || animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-amber-300 px-3.5 py-1 rounded-full text-xs font-black tracking-wider shadow-md">
                      {animal.category}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20">
                      <span className="text-xs text-amber-300 font-mono italic block">
                        {animal.scientificName}
                      </span>
                      <span className="text-xs text-stone-200 font-semibold truncate block">
                        📍 {animal.habitat}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-adventure text-2xl text-stone-900">
                          {isEs ? animal.name : animal.nameEn || animal.name}
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                          {animal.status}
                        </span>
                      </div>
                      <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed mt-2">
                        {isEs ? animal.funFact : animal.funFactEn || animal.funFact}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-stone-200/60 flex items-center justify-between">
                      <Link
                        to={`/especie/${animal.id}`}
                        className="inline-flex items-center gap-1.5 font-adventure text-sm text-emerald-800 hover:text-emerald-950 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Ficha Completa</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {animal.audioUrl && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                          <Volume2 className="w-3.5 h-3.5" /> Audio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. MUNDO NIÑOS & FAMILIAS (#ninos) */}
      <section id="ninos" className="py-20 md:py-24 bg-gradient-to-b from-amber-50 to-emerald-50 border-t border-amber-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-14 border-3 border-amber-300 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200 text-amber-950 font-adventure text-xs uppercase mb-4">
                  🎈 Para los Pequeños Exploradores
                </div>
                <h2 className="font-adventure text-4xl sm:text-5xl text-stone-900 leading-tight text-adventure-shadow">
                  ¡AVENTURA PARA NIÑOS EN EL ZOO!
                </h2>
                <p className="text-stone-600 text-base sm:text-lg mt-4 leading-relaxed font-medium">
                  Tenemos actividades didácticas diseñadas para despertar el amor por la naturaleza en las nuevas generaciones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <span className="text-2xl mb-1 block">🎒</span>
                    <h4 className="font-adventure text-lg text-amber-950">Pasaporte Safari</h4>
                    <p className="text-xs text-stone-600 mt-1">Sella cada estación de animales y gana una insignia de guardabosques.</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <span className="text-2xl mb-1 block">🎨</span>
                    <h4 className="font-adventure text-lg text-emerald-950">Talleres Verdes</h4>
                    <p className="text-xs text-stone-600 mt-1">Manualidades con materiales reciclados y siembra de plantas nativas.</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <span className="text-2xl mb-1 block">📸</span>
                    <h4 className="font-adventure text-lg text-amber-950">Fotos de Recuerdo</h4>
                    <p className="text-xs text-stone-600 mt-1">Lévate polaroids y fotos divertidas con los escenarios del zoológico.</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <span className="text-2xl mb-1 block">🚂</span>
                    <h4 className="font-adventure text-lg text-emerald-950">Tren Safari</h4>
                    <p className="text-xs text-stone-600 mt-1">Paseo sobre rieles por los senderos más hermosos y seguros.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&q=80&w=800"
                    alt="Niños en el zoológico"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="font-adventure text-2xl text-amber-300 block">Momentos Inolvidables</span>
                    <span className="text-xs text-stone-200">Abierto los fines de semana con espectáculos educativos familiares.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PLANIFICA TU VISITA & MAPA */}
      <section className="py-20 md:py-24 bg-stone-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>Planifica tu Recorrido</span>
              </div>
              <h2 className="font-adventure text-4xl sm:text-5xl text-white tracking-wide text-adventure-shadow mb-6">
                HORARIOS Y CÓMO LLEGAR
              </h2>
              <p className="text-stone-300 text-base sm:text-lg mb-8 leading-relaxed font-medium">
                Estamos ubicados en la hermosa reserva natural Cerro Hueco. Disfruta de aire fresco, sombra natural y senderos señalizados.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
                  <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-base">Horarios de Entrada</h4>
                    <p className="text-sm text-stone-300">Martes a Domingo: 9:00 AM a 5:00 PM (Taquilla cierra a las 4:00 PM). Lunes cerrado por mantenimiento.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
                  <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-base">Dirección</h4>
                    <p className="text-sm text-stone-300">Calzada Cerro Hueco S/N, Col. Zapotal, Tuxtla Gutiérrez, Chiapas.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/mapa"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-adventure text-lg px-8 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105"
                >
                  <Compass className="w-5 h-5" />
                  <span>Ver Mapa Interactivo</span>
                </Link>

                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-adventure text-lg px-8 py-3.5 rounded-2xl border border-stone-700 shadow-md transition-transform hover:scale-105"
                >
                  <span>Contacto y Dudas</span>
                </Link>
              </div>
            </div>

            <div className="relative h-[420px] rounded-3xl overflow-hidden border-4 border-amber-600/50 shadow-2xl">
              <iframe
                title="Ubicación Zoológico"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.612711003444!2d-93.0975618!3d16.7460298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ed272bc9776d63%3A0xc3f6a2c2622fbb95!2sZool%C3%B3gico%20Regional%20Miguel%20%C3%81lvarez%20del%20Toro!5e0!3m2!1ses!2smx!45"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
