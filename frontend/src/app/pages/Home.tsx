import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { 
  ArrowRight, Users, Heart, TreePine, Calendar, MapPin, Ticket, Clock, 
  BookOpen, ChevronLeft, ChevronRight, Play, PawPrint, Map
} from "lucide-react";
import { useZoo } from "../context/ZooContext";

const transparencyBanners = [
  {
    image: "/assets/images/plataforma-nacional-transparencia.png",
    alt: "Plataforma Nacional de Transparencia",
    href: "https://www.plataformadetransparencia.org.mx/Inicio",
  },
  {
    image: "/assets/images/transparencia-pueblo.png",
    alt: "Transparencia del Pueblo",
    href: "https://anticorrupcionybg.gob.mx/transparenciapueblo/",
  },
  {
    image: "/assets/images/transparencia-para-el-pueblo.png",
    alt: "Plataforma Nacional de Transparencia",
    href: "https://www.plataformadetransparencia.org.mx/Inicio",
  },
  {
    image: "/assets/images/consulta-transparencia.png",
    alt: "Consulta Pública INAI (ZooMAT)",
    href: "https://consultapublicamx.inai.org.mx/vut-web/?idSujetoObigadoParametro=1179&idEntidadParametro=7&idSectorParametro=",
  },
];

// ── Hero Carousel (Adaptativo con Fondo Difuminado Ambiental) ─────────────────
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
    return <div className="w-full h-full bg-stone-950" />;
  }

  const slide = slides[current];

  return (
    <div className="w-full h-full relative group bg-black overflow-hidden select-none">
      {/* Degradados para resaltar botones y texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none z-10" />

      {/* Renderizado de Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {s.type === "image" ? (
            <div className="w-full h-full relative bg-stone-950 flex items-center justify-center overflow-hidden">
              {/* 1. Fondo dinámico desenfocado: cubre todo el marco con los colores de la foto */}
              <img
                src={s.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-125 pointer-events-none select-none transition-all duration-700"
              />
              <div className="absolute inset-0 bg-black/25 pointer-events-none z-0" />

              {/* 2. Imagen principal: Nítida, en su proporción exacta, nunca se recorta */}
              <img
                src={s.src}
                alt={s.alt || "Imagen del carrusel"}
                className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain object-center select-none drop-shadow-2xl transition-transform duration-700"
              />
            </div>
          ) : (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              {(() => {
                const url = s.src || "";
                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (ytMatch) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${playing ? 1 : 0}&enablejsapi=1&rel=0`}
                      title={s.alt || "Video del carrusel"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                if (url.includes("facebook.com")) {
                  return (
                    <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=${playing ? 1 : 0}`}
                      className="w-full h-full border-0"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <video
                      src={s.src}
                      poster={s.poster}
                      className="w-full h-full object-cover"
                      loop
                      controls={playing}
                      playsInline
                      ref={(el) => {
                        if (!el) return;
                        if (i === current && playing) {
                          el.play().catch(() => {});
                        } else {
                          el.pause();
                        }
                      }}
                    />
                    {!playing && (
                      <button
                        onClick={() => setPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors z-20 cursor-pointer"
                      >
                        <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full wood-texture-bg text-amber-300 border-2 border-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform wood-button-shadow">
                          <Play size={32} className="ml-1 fill-amber-300" />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ))}

      {/* Contador superior (01 / 03) */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 bg-black/65 backdrop-blur-md text-white font-mono text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 shadow-xl tracking-wider">
        {String(current + 1).padStart(2, "0")}{" "}
        <span className="text-amber-300/80">/ {String(total).padStart(2, "0")}</span>
      </div>

      {/* Badge de descripción opcional */}
      {slide?.alt && (
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 hidden sm:inline-flex items-center gap-2 bg-black/65 backdrop-blur-md text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-400/30 shadow-xl">
          <span>{slide.alt}</span>
        </div>
      )}

      {/* Flechas de navegación rústicas */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 hover:border-amber-300 transition-all duration-200 cursor-pointer wood-button-shadow"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
      </button>

      <button
        onClick={next}
        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 hover:border-amber-300 transition-all duration-200 cursor-pointer wood-button-shadow"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
      </button>

      {/* Puntos indicadoras centrados */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-lg">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setPlaying(false);
            }}
            className={`rounded-full transition-all duration-200 cursor-pointer ${
              i === current ? "w-5 sm:w-6 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
            }`}
            aria-label={`Diapositiva ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export function Home() {
  const { animals } = useZoo();

  const highlights = [
    { icon: Users, title: "50+ Especies", description: "Fauna nativa de Chiapas" },
    { icon: TreePine, title: "Conservación", description: "Protegemos y rehabilitamos especies en peligro de extinción nativas de nuestra región." },
    { icon: Heart, title: "Educación", description: "Programas educativos para concientizar sobre la importancia de nuestra biodiversidad." },
  ];

  return (
    <div className="bg-[#faf8f2] text-stone-900">
      {/* 1. Sección Hero con Carrusel a Marco Completo */}
      <section className="relative w-full overflow-hidden bg-stone-950 no-reveal">
        {/* Barra superior de madera */}
        <div className="wood-texture-bg h-5 sm:h-8 w-full border-t-2 border-b-4 border-[#2b1706] shadow-2xl relative z-30">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-200/25" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/45" />
        </div>

        {/* Contenedor Adaptativo Completo */}
        <div className="w-full h-[360px] xs:h-[400px] sm:h-[500px] md:h-[600px] lg:h-[680px] relative">
          <HeroCarousel />

          {/* Botones de acción flotantes (Especies, Visita, Mapa) */}
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 sm:gap-4 w-[94%] max-w-xl px-1">
            <Link
              to="/especies"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 px-2 rounded-xl bg-black/80 hover:bg-[#731c34] text-white border-2 border-amber-400/80 hover:border-amber-300 backdrop-blur-md shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 font-sans font-bold text-xs sm:text-sm tracking-wide group"
            >
              <PawPrint className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{"Especies"}</span>
            </Link>

            <Link
              to="/visita"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 px-2 rounded-xl bg-black/80 hover:bg-[#731c34] text-white border-2 border-amber-400/80 hover:border-amber-300 backdrop-blur-md shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 font-sans font-bold text-xs sm:text-sm tracking-wide group"
            >
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{"Visita"}</span>
            </Link>

            <Link
              to="/mapa"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 px-2 rounded-xl bg-black/80 hover:bg-[#731c34] text-white border-2 border-amber-400/80 hover:border-amber-300 backdrop-blur-md shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 font-sans font-bold text-xs sm:text-sm tracking-wide group"
            >
              <span>{"Mapa"}</span>
            </Link>
          </div>
        </div>

        {/* Barra inferior de madera */}
        <div className="wood-texture-bg h-5 sm:h-8 w-full border-t-2 border-b-4 border-[#2b1706] shadow-2xl relative z-30">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-200/25" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/45" />
        </div>
      </section>

      {/* 2. Sección de Introducción de Cabecera */}
      <section className="reveal-on-scroll relative bg-[#f7f3e8] border-b border-[#e2d5bd] py-12 md:py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#854d0e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-950 text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs border border-amber-300">
              <TreePine className="w-4 h-4 text-emerald-800" />
              <span>{"Zoológico Regional Miguel Álvarez del Toro"}</span>
            </div>

            <h1 className="font-adventure text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
              {"Bienvenidos al ZOOMAT"}
            </h1>

            <p className="text-lg md:text-xl text-stone-700 leading-relaxed font-semibold">
              {"El único zoológico en México dedicado exclusivamente a la conservación, exhibición e investigación de la fauna silvestre nativa del estado de Chiapas en su entorno selvático natural."}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/visita"
                className="inline-flex items-center gap-2.5 wood-texture-bg text-amber-200 hover:text-white border-2 border-amber-600/80 px-6 py-3.5 rounded-xl text-base font-adventure shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 wood-button-shadow"
              >
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>{"Planear Visita"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/especies"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-amber-50 text-stone-900 border-2 border-amber-800/30 px-6 py-3.5 rounded-xl text-base font-adventure shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <span>{"Explorar Catálogo"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Highlights Section */}
      <section className="reveal-on-scroll py-14 md:py-20 bg-white border-b border-[#e8dfcf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="interactive-card flex flex-col items-start p-6 rounded-2xl bg-[#faf7ef] border-2 border-[#e6dbc7] hover:border-amber-400 hover:bg-[#fffdf7] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out shadow-sm group"
              >
                <div className="wood-texture-bg p-3.5 rounded-xl mb-4 text-amber-300 border border-amber-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-adventure text-xl text-stone-900 mb-2 tracking-wide group-hover:text-amber-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-stone-600 leading-relaxed font-medium text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Animals */}
      <section className="reveal-on-scroll py-14 md:py-20 bg-[#faf6ee] border-b border-[#e2d5bd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
                <TreePine className="w-3.5 h-3.5 text-emerald-700" />
                <span>{"Especies"}</span>
              </div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-stone-900 tracking-wide">
                Especies
              </h2>
              <p className="text-stone-600 max-w-2xl font-semibold text-base mt-1">
                {"Conoce algunos de nuestros habitantes más emblemáticos que protegemos en el zoológico."}
              </p>
            </div>
            <Link
              to="/especies"
              className="font-adventure text-sm text-amber-950 bg-amber-300 hover:bg-amber-400 border-2 border-amber-500 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <span>{"Ver catálogo completo"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {animals.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-2xl border-2 border-dashed border-amber-300">
                <p className="text-stone-800 font-bold text-base">
                  {"No hay especies registradas actualmente."}
                </p>
              </div>
            ) : (
              animals.slice(0, 3).map((animal) => (
                <div
                  key={animal.id}
                  className="interactive-card bg-white rounded-2xl overflow-hidden border-2 border-[#e6dbc7] shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-60 overflow-hidden bg-stone-900">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="card-badge absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                      {animal.status}
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between gap-2 flex-1 bg-white">
                    <h3 className="font-adventure text-xl text-stone-900 group-hover:text-amber-900 transition-colors">
                      {animal.name}
                    </h3>
                    <Link
                      to={`/animales?id=${animal.id}`}
                      className="text-emerald-900 hover:text-emerald-950 font-adventure text-xs bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg border border-emerald-300 transition-all"
                    >
                      {"Ver más →"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Visit Info */}
      <section className="reveal-on-scroll py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="wood-texture-dark rounded-3xl p-6 md:p-12 text-white overflow-hidden relative shadow-2xl border-4 border-amber-700/60">
            <div className="absolute inset-0 bg-stone-950/80 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{"Tu visita"}</span>
                </div>
                <h2 className="font-adventure text-2xl md:text-4xl mb-4 tracking-wide text-white">
                  {"Planifica tu recorrido"}
                </h2>
                <p className="text-stone-300 text-base mb-6 leading-relaxed font-medium">
                  {"Estamos abiertos de martes a domingo. Ven y vive una experiencia educativa inmersiva para toda la familia en el corazón de la selva."}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-stone-200 bg-black/40 p-3.5 rounded-xl border border-amber-900/60">
                    <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white text-sm">{"Horario de apertura"}</p>
                      <p className="text-xs text-amber-200">{"Martes a Domingo: 9:00 - 17:00"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-stone-200 bg-black/40 p-3.5 rounded-xl border border-amber-900/60">
                    <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white text-sm">{"Ubicación"}</p>
                      <p className="text-xs text-amber-200">{"Calzada Cerro Hueco, Tuxtla Gutiérrez"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-stone-200 bg-black/40 p-3.5 rounded-xl border border-amber-900/60">
                    <Ticket className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white text-sm">{"Admisión"}</p>
                      <p className="text-xs text-amber-200">{"Entrada general: $30 MXN"}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/visita"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3 rounded-xl font-adventure text-base transition-all shadow-md wood-button-shadow"
                >
                  <span>{"Ver Más Detalles"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-900 border-2 border-amber-600/60 shadow-xl">
                <iframe
                  title="Google Maps ZooMAT"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.612711003444!2d-93.0975618!3d16.7460298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ed272bc9776d63%3A0xc3f6a2c2622fbb95!2sZool%C3%B3gico%20Regional%20Miguel%20%C3%81lvarez%20del%20Toro!5e0!3m2!1ses!2smx!45"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banners de Transparencia */}
      <section className="reveal-on-scroll pt-6 pb-4 sm:pt-8 sm:pb-6 bg-[#faf8f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {transparencyBanners.map((banner, idx) => (
              <a
                key={`${banner.image}-${banner.href}`}
                href={banner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-card group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  loading="lazy"
                  className="block w-full max-w-full h-auto aspect-[3.2/1] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="sr-only">Abrir {banner.alt}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}