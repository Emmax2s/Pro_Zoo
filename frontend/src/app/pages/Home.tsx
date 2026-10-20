import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { 
  ArrowRight, Users, Heart, TreePine, Calendar, MapPin, Ticket, Clock, 
  BookOpen, ChevronLeft, ChevronRight, Play
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useZoo } from "../context/ZooContext";
import { getLocalizedAnimal } from "../services/speciesTranslator";

// ── Hero Carousel (Clean & Beautiful with Wooden Controls) ───────────────────
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
    return <div className="w-full h-full bg-stone-900" />;
  }

  const slide = slides[current];

  return (
    <div className="w-full h-full relative group bg-black overflow-hidden select-none">
      {/* Subtle top/bottom shadow gradients for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none z-10" />

      {/* Slides from Admin / ZooContext */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {s.type === "image" ? (
            <div className="w-full h-full relative bg-stone-950 flex items-center justify-center overflow-hidden">
              {/* Blurred ambient background so the photo is not harshly cut */}
              <img
                src={s.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-35 select-none pointer-events-none"
              />
              {/* Cleanly fitted foreground photo */}
              <img
                src={s.src}
                alt={s.alt || "Zoológico"}
                className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center select-none transition-transform duration-700"
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
                      title={s.alt || "Video"}
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
                      className="max-h-full max-w-full w-auto h-auto object-contain"
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
                        <span className="w-20 h-20 rounded-full wood-texture-bg text-amber-300 border-2 border-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform wood-button-shadow">
                          <Play size={36} className="ml-1 fill-amber-300" />
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

      {/* Counter pill (Photo 1 Style: 01 / 04) */}
      <div className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full border border-amber-400/30 shadow-xl tracking-wider">
        {String(current + 1).padStart(2, "0")}{" "}
        <span className="text-amber-300/80">/ {String(total).padStart(2, "0")}</span>
      </div>

      {/* Slide description badge if available */}
      {slide?.alt && (
        <div className="absolute top-6 left-6 z-20 hidden sm:inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-400/30 shadow-xl">
          <span>{slide.alt}</span>
        </div>
      )}

      {/* Round Wooden Navigation Arrows (Photo 1 Signature Style) */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-amber-300 transition-all cursor-pointer wood-button-shadow"
        aria-label="Anterior diapositiva"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full wood-texture-dark border-2 border-amber-500 text-amber-300 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-amber-300 transition-all cursor-pointer wood-button-shadow"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Dots / Indicators Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-amber-400/30 shadow-lg">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setPlaying(false);
            }}
            className={`rounded-full transition-all cursor-pointer ${
              i === current ? "w-7 h-2.5 bg-amber-400" : "w-2.5 h-2.5 bg-white/60 hover:bg-white"
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
  const { t } = useTranslation();
  const { animals, currentLang } = useZoo();
  const isEs = currentLang === "es";

  const highlights = [
    {
      icon: Users,
      title: isEs ? "50+ Especies" : "50+ Species",
      description: isEs ? "Fauna nativa de Chiapas" : "Native wildlife of Chiapas",
    },
    {
      icon: TreePine,
      title: t("home.highlights.conservation"),
      description: t("home.highlights.conservationDesc"),
    },
    {
      icon: Heart,
      title: t("home.highlights.education"),
      description: t("home.highlights.educationDesc"),
    },
  ];

  return (
    <div className="bg-[#faf8f2] text-stone-900">
      {/* 1. Full-bleed Edge-to-Edge Hero Carousel with Top & Bottom Wood Beams */}
      <section className="relative w-full overflow-hidden bg-stone-950">
        {/* Barra café rústica superior (arriba de la imagen del carrusel) */}
        <div className="wood-texture-bg h-7 sm:h-9 w-full border-t-2 border-b-4 border-[#2b1706] shadow-2xl relative z-30">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-200/25" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/45" />
        </div>

        <div className="w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[720px] relative">
          <HeroCarousel />
        </div>

        {/* Rustic Wood Beam Framing the Carousel (Photo 1 Style) */}
        <div className="wood-texture-bg h-7 sm:h-9 w-full border-t-2 border-b-4 border-[#2b1706] shadow-2xl relative z-30">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-200/25" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/45" />
        </div>
      </section>

      {/* 2. Sección de Introducción de Cabecera */}
      <section className="relative bg-[#f7f3e8] border-b border-[#e2d5bd] py-14 md:py-20 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#854d0e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/90 text-amber-950 text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs border border-amber-300">
              <TreePine className="w-4 h-4 text-emerald-800" />
              <span>{t("home.hero.tag")}</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.1] text-adventure-shadow">
              {t("home.hero.title")}
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              {t("home.hero.desc")}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/visita"
                className="inline-flex items-center gap-3 wood-texture-bg text-amber-200 hover:text-white border-2 border-amber-600/80 px-8 py-4 rounded-2xl text-lg font-adventure shadow-lg hover:shadow-xl hover:scale-105 transition-all wood-button-shadow"
              >
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>{t("home.hero.planVisit")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/animales"
                className="inline-flex items-center gap-3 bg-white hover:bg-amber-50 text-stone-900 border-2 border-amber-800/30 px-8 py-4 rounded-2xl text-lg font-adventure shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <span>{t("home.hero.exploreCatalog")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Highlights Section */}
      <section className="py-20 md:py-24 bg-white border-b border-[#e8dfcf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start p-8 rounded-3xl bg-[#faf7ef] border-2 border-[#e6dbc7] hover:border-amber-400 hover:bg-[#fffdf7] transition-all shadow-sm hover:shadow-xl group"
              >
                <div className="wood-texture-bg p-4 rounded-2xl mb-6 text-amber-300 border border-amber-600 shadow-md group-hover:scale-105 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-adventure text-2xl text-stone-900 mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-stone-600 leading-relaxed font-medium text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Animals (Real Animals from ZooContext / Admin) */}
      <section className="py-20 md:py-24 bg-[#faf6ee] border-b border-[#e2d5bd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
                <TreePine className="w-3.5 h-3.5 text-emerald-700" />
                <span>Biodiversidad Protegida</span>
              </div>
              <h2 className="font-adventure text-3xl sm:text-5xl text-stone-900 tracking-wide text-adventure-shadow">
                {t("home.featured.title")}
              </h2>
              <p className="text-stone-600 max-w-2xl font-semibold text-lg md:text-xl mt-2">
                {t("home.featured.desc")}
              </p>
            </div>
            <Link
              to="/animales"
              className="font-adventure text-base text-amber-950 bg-amber-300 hover:bg-amber-400 border-2 border-amber-500 px-6 py-3 rounded-2xl shadow-sm hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{t("home.featured.viewAll")}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {animals.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border-2 border-dashed border-amber-300">
                <p className="text-stone-800 font-bold text-lg">
                  {isEs ? "No hay especies registradas actualmente." : "No species currently registered."}
                </p>
                <p className="text-stone-500 text-sm mt-1">
                  {isEs
                    ? "Las especies agregadas desde el panel de administración aparecerán aquí."
                    : "Species added from the admin panel will appear here."}
                </p>
              </div>
            ) : (
              animals.slice(0, 3).map((animal) => {
                const loc = getLocalizedAnimal(animal, isEs);
                return (
                  <div
                    key={animal.id}
                    className="bg-white rounded-3xl overflow-hidden border-2 border-[#e6dbc7] shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col"
                  >
                    <div className="relative h-72 overflow-hidden bg-stone-900">
                      <img
                        src={animal.image}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md border border-amber-400/30">
                        {loc.status}
                      </div>
                    </div>
                    <div className="p-7 flex items-center justify-between gap-3 flex-1 bg-white">
                      <h3 className="font-adventure text-2xl text-stone-900">
                        {loc.name}
                      </h3>
                      <Link
                        to={`/animales?id=${animal.id}`}
                        className="text-emerald-900 hover:text-emerald-950 font-adventure text-sm bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 shadow-xs transition-colors"
                      >
                        {isEs ? "Ver más →" : "View more →"}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. Visit Info (Real Hours, Admission & Google Maps) */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="wood-texture-dark rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl border-4 border-amber-700/60">
            {/* Elegant wood glow overlay */}
            <div className="absolute inset-0 bg-stone-950/80 pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-amber-600 opacity-20 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-widest uppercase mb-6 border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t("home.visit.tag")}</span>
                </div>
                <h2 className="font-adventure text-3xl md:text-5xl mb-6 tracking-wide text-white text-adventure-shadow">
                  {t("home.visit.title")}
                </h2>
                <p className="text-stone-300 text-lg mb-10 leading-relaxed font-medium">
                  {t("home.visit.desc")}
                </p>

                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4 text-stone-200 bg-black/40 p-4 rounded-2xl border border-amber-900/60">
                    <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.hoursTitle")}</p>
                      <p className="text-sm text-amber-200">{t("home.visit.hoursDesc")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-stone-200 bg-black/40 p-4 rounded-2xl border border-amber-900/60">
                    <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.locationTitle")}</p>
                      <p className="text-sm text-amber-200">{t("home.visit.locationDesc")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-stone-200 bg-black/40 p-4 rounded-2xl border border-amber-900/60">
                    <Ticket className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.admissionTitle")}</p>
                      <p className="text-sm text-amber-200">{t("home.visit.admissionDesc")}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/visita"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 px-8 py-4 rounded-2xl font-adventure text-lg transition-all shadow-lg hover:scale-105 wood-button-shadow"
                >
                  <span>{t("home.visit.moreDetails")}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative h-[30rem] rounded-3xl overflow-hidden bg-stone-900 border-4 border-amber-600/60 shadow-2xl">
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

      {/* 6. Conservation Message */}
      <section className="py-20 md:py-24 bg-[#faf6ee] text-center border-t border-[#e2d5bd]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="wood-texture-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-6 border border-amber-500 shadow-md">
            <Heart className="w-8 h-8 text-amber-300 -rotate-6" />
          </div>
          <h2 className="font-adventure text-3xl md:text-5xl text-stone-900 mb-6 tracking-wide text-adventure-shadow">
            {t("home.conservation.title")}
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed mb-10 font-medium">
            {t("home.conservation.desc")}
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 text-stone-900 font-adventure text-base hover:text-amber-950 transition-colors bg-white px-8 py-3.5 rounded-full border-2 border-amber-400 shadow-md hover:shadow-lg hover:scale-105"
          >
            <span>{t("home.conservation.support")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
