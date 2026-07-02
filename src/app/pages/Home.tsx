import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowRight, Users, Heart, TreePine, Calendar, MapPin, Ticket, Clock, Shield, BookOpen, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useZoo } from "../context/ZooContext";

function HeroCarousel() {
  const { slides } = useZoo();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
    setPlaying(false);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
    setPlaying(false);
  }, [total]);

  useEffect(() => {
    if (!slides[current] || slides[current].type === "video") return;
    const id = setTimeout(next, 4000);
    return () => clearTimeout(id);
  }, [current, next, slides]);

  if (slides.length === 0) return <div className="w-full h-full bg-emerald-100" />;

  const slide = slides[current];

  return (
    <div className="w-full h-full relative group">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {s.type === "image" ? (
            <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full relative">
              <video
                src={s.src}
                poster={s.poster}
                className="w-full h-full object-cover"
                loop
                playsInline
                ref={(el) => {
                  if (!el) return;
                  if (i === current && playing) el.play();
                  else el.pause();
                }}
              />
              {!playing && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Play size={28} className="text-emerald-700 ml-1" />
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPlaying(false); }}
            className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>

      {/* Video badge */}
      {slide.type === "video" && (
        <span className="absolute top-3 left-3 z-20 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Play size={10} /> VIDEO
        </span>
      )}
    </div>
  );
}

export function Home() {
  const { t } = useTranslation();

  const highlights = [
    {
      icon: Users,
      title: "50+ Especies",
      description: "Fauna nativa de Chiapas"
    },
    {
      icon: TreePine,
      title: t("home.highlights.conservation"),
      description: t("home.highlights.conservationDesc")
    },
    {
      icon: Heart,
      title: t("home.highlights.education"),
      description: t("home.highlights.educationDesc")
    }
  ];

  const featuredAnimals = [
    {
      name: "Jaguar",
      image: "/assets/images/jaguar.svg",
      status: "En Peligro"
    },
    {
      name: "Tucán Pico Iris",
      image: "/assets/images/toucan.svg",
      status: "Amenazada"
    },
    {
      name: "Guacamaya Roja",
      image: "/assets/images/macaw.svg",
      status: "Amenazada"
    }
  ];

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-emerald-50 border-b border-emerald-100 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-emerald-200">
              <TreePine className="w-3.5 h-3.5" />
              <span>{t("home.hero.tag")}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-emerald-950">
              {t("home.hero.title1")}<span className="text-emerald-700">{t("home.hero.titleHighlight")}</span>{t("home.hero.title2")}
            </h1>
            <p className="text-lg md:text-xl text-emerald-800/80 mb-8 leading-relaxed max-w-2xl font-medium">
              {t("home.hero.desc")}
            </p>
            <div className="flex flex-wrap gap-4">
              
              
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-emerald-200 border-8 border-white shadow-2xl relative rotate-2 hover:rotate-0 transition-transform duration-500">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {highlights.map((item, index) => (
              <div key={index} className="flex flex-col items-start p-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                <div className="bg-emerald-100 p-3 rounded-xl mb-6 text-emerald-700">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-3 tracking-tight">{item.title}</h3>
                <p className="text-emerald-800/70 leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Animals */}
      <section className="py-24 bg-emerald-50/50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mb-3 tracking-tight">{t("home.featured.title")}</h2>
              <p className="text-emerald-800/70 max-w-xl font-medium">{t("home.featured.desc")}</p>
            </div>
            <Link
              to="/animales"
              className="text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1 group bg-emerald-100/50 px-4 py-2 rounded-full"
            >
              {t("home.featured.viewAll")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAnimals.map((animal, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden bg-emerald-100">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-900 shadow-sm">
                    {animal.status}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-emerald-950">{animal.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Info */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-emerald-950 rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl shadow-emerald-900/20">
            {/* Elegant dark green gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-950" />
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-800 opacity-40 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-6 border border-emerald-800">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t("home.visit.tag")}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">{t("home.visit.title")}</h2>
                <p className="text-emerald-200/90 text-lg mb-10 leading-relaxed font-medium">
                  {t("home.visit.desc")}
                </p>
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4 text-emerald-100 bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/50">
                    <Clock className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.hoursTitle")}</p>
                      <p className="text-sm text-emerald-200">{t("home.visit.hoursDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-emerald-100 bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/50">
                    <MapPin className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.locationTitle")}</p>
                      <p className="text-sm text-emerald-200">{t("home.visit.locationDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-emerald-100 bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/50">
                    <Ticket className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{t("home.visit.admissionTitle")}</p>
                      <p className="text-sm text-emerald-200">{t("home.visit.admissionDesc")}</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/visita"
                  className="inline-flex items-center gap-2 bg-emerald-500 text-emerald-950 px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  {t("home.visit.moreDetails")}
                </Link>
              </div>
              <div className="relative h-[32rem] rounded-3xl overflow-hidden bg-emerald-900 border-8 border-emerald-900/50 shadow-2xl">
                <img
                  src="/assets/images/entrance.svg"
                  alt="Entrada del ZooMAT"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conservation Message */}
      <section className="py-24 bg-emerald-50/50 text-center border-t border-emerald-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-12">
            <Heart className="w-8 h-8 text-emerald-700 -rotate-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-950 mb-6 tracking-tight">{t("home.conservation.title")}</h2>
          <p className="text-lg text-emerald-800/80 leading-relaxed mb-10 font-medium">
            {t("home.conservation.desc")}
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-900 transition-colors bg-white px-6 py-3 rounded-full border border-emerald-200 shadow-sm hover:shadow-md"
          >
            {t("home.conservation.support")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
