import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Ticket, ChevronLeft, ChevronRight, Lightbulb, Compass, Award, Volume2, Info, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useZoo } from "../context/ZooContext";

const statusConfig: Record<string, { color: string; label: string }> = {
  "En Peligro de Extinción": { color: "#dc2626", label: "En peligro de extinción" },
  "Amenazada": { color: "#d97706", label: "Amenazada" },
  "Protegida Especial": { color: "#ca8a04", label: "Protegida especial" },
  "Preocupación Menor": { color: "#16a34a", label: "Estable" },
};

export function Home() {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === "es";
  const { animals } = useZoo();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const categories = isEs
    ? ["Todos", "Mamífero", "Ave", "Reptil"]
    : ["All", "Mammal", "Bird", "Reptile"];

  const filtered = animals.filter((a) => {
    if (activeCategory === "Todos" || activeCategory === "All") return true;
    return a.category === activeCategory;
  });

  const current = filtered[currentIndex] ?? filtered[0] ?? animals[0];
  const st = statusConfig[current.status] ?? { color: "#16a34a", label: current.status };

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 350);
  }, [isTransitioning]);

  const next = useCallback(() => {
    if (filtered.length === 0) return;
    goTo((currentIndex + 1) % filtered.length);
  }, [currentIndex, filtered.length, goTo]);

  const prev = useCallback(() => {
    if (filtered.length === 0) return;
    goTo((currentIndex - 1 + filtered.length) % filtered.length);
  }, [currentIndex, filtered.length, goTo]);

  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [activeCategory]);

  useEffect(() => {
    if (!autoplay || filtered.length <= 1) return;
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) next();
    }, 50);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [autoplay, currentIndex, filtered.length, next]);

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      {/* ── HERO CAROUSEL (DISEÑO INMERSIVO INTERFAZ.GIT) ── */}
      <section className="relative h-[90vh] min-h-[580px] overflow-hidden bg-[#0d1f15]">
        {/* Imagen principal */}
        <img
          key={current.id}
          src={current.image}
          alt={current.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
            isTransitioning ? "opacity-0 scale-105" : "opacity-85 scale-100"
          }`}
        />

        {/* Gradientes decorativos */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05120a] via-[#05120a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05120a]/80 via-transparent to-transparent" />

        {/* Insignia de zona top-left */}
        <div className="absolute top-8 left-8 sm:left-12 z-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/10 border border-white/20 text-white/90 backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {current.zone || (isEs ? "Reserva El Zapotal" : "El Zapotal Reserve")}
          </span>
        </div>

        {/* Contador top-right */}
        <div className="absolute top-8 right-8 sm:right-12 z-20 flex items-baseline gap-1">
          <span className="text-3xl font-light text-white/90 transition-opacity duration-300">
            {current.num || String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-white/40 font-medium">
            / {String(filtered.length).padStart(2, "0")}
          </span>
        </div>

        {/* Contenido inferior Hero */}
        <div className="absolute bottom-0 inset-x-0 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 z-20">
          {/* Título de la especie */}
          <div className="max-w-2xl transition-opacity duration-300">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              {isEs ? current.category : current.category} • ZooMAT Chiapas
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-2">
              {isEs ? current.name : (current.nameEn || current.name)}
            </h1>
            <p className="text-xl sm:text-2xl italic font-serif text-white/60 mb-6">
              ({current.scientificName})
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white/70">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="uppercase tracking-wider">{isEs ? current.status : (current.statusEn || current.status)}</span>
              </div>
              {current.feedingTime && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEs ? `Alimentación: ${current.feedingTime}` : `Feeding: ${current.feedingTime}`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Carrusel de miniaturas y controles */}
          <div className="flex flex-col items-end gap-4 shrink-0 self-end">
            {/* Tira de miniaturas */}
            <div className="flex gap-2.5">
              {filtered.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAutoplay(false);
                    goTo(i);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden p-0 transition-all cursor-pointer border-2 ${
                    a.id === current.id ? "border-emerald-400 scale-105 shadow-lg" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Barra de progreso y botones previo/siguiente */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                onClick={() => {
                  setAutoplay(false);
                  prev();
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setAutoplay(false);
                  next();
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE FILTROS POR CATEGORÍA ── */}
      <div className="bg-white border-b border-emerald-100 sticky top-24 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-emerald-800 hover:bg-emerald-50 bg-stone-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-emerald-800 shrink-0">
            {filtered.length} {isEs ? "especies exhibidas" : "species exhibited"}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DE DETALLE DE LA ESPECIE SELECCIONADA ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Columna Izquierda: Información Detallada */}
          <div className="lg:col-span-7 space-y-8 transition-opacity duration-300">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-0.5 bg-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  {current.zone || "Reserva Natural ZooMAT"}
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black text-emerald-950 tracking-tight leading-tight">
                {isEs ? current.name : (current.nameEn || current.name)}
              </h2>
              <p className="text-lg text-emerald-700 italic font-serif mt-1">
                ({current.scientificName})
              </p>
            </div>

            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-medium">
              {current.description || current.habitat}
            </p>

            {/* Llamado de Dato Científico */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
              <div className="p-3 rounded-xl bg-emerald-100 text-amber-600 shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-1">
                  {isEs ? "DATO CIENTÍFICO INTERESANTE" : "INTERESTING SCIENTIFIC FACT"}
                </h4>
                <p className="text-sm sm:text-base text-emerald-950 font-medium leading-relaxed">
                  {isEs ? current.funFact : (current.funFactEn || current.funFact)}
                </p>
              </div>
            </div>

            {/* Cuadrícula de Métricas de la Especie */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-100 p-2 rounded-2xl border border-stone-200">
              <div className="bg-white p-4 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEs ? "Dieta" : "Diet"}
                </span>
                <span className="text-base font-black text-emerald-950">
                  {isEs ? current.diet : (current.dietEn || current.diet)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEs ? "Esperanza" : "Lifespan"}
                </span>
                <span className="text-base font-black text-emerald-950">
                  {current.lifespan || "15–20 años"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEs ? "Peso Promedio" : "Avg Weight"}
                </span>
                <span className="text-base font-black text-emerald-950">
                  {current.weight || "N/A"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEs ? "Estatura / Talla" : "Height / Size"}
                </span>
                <span className="text-base font-black text-emerald-950">
                  {current.height || "N/A"}
                </span>
              </div>
            </div>

            {/* Botón para ver ficha completa en catálogo */}
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to={`/especie/${current.id}`}
                className="inline-flex items-center gap-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-7 py-4 rounded-2xl transition-all shadow-md hover:scale-105 text-base"
              >
                <span>{isEs ? "Ver Ficha Completa del Animal" : "View Full Animal File"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Colección de Especies */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 pb-2 border-b border-stone-100">
              {isEs ? "Colección de Fauna del ZooMAT" : "ZooMAT Fauna Collection"}
            </h3>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filtered.map((a, i) => {
                const active = a.id === current.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      setAutoplay(false);
                      goTo(i);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left cursor-pointer border ${
                      active ? "bg-emerald-50 border-emerald-300 shadow-xs" : "bg-transparent border-transparent hover:bg-stone-50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 ${active ? "border-emerald-700" : "border-transparent"}`}>
                      <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-extrabold truncate ${active ? "text-emerald-950" : "text-stone-800"}`}>
                        {isEs ? a.name : (a.nameEn || a.name)}
                      </h4>
                      <p className="text-xs text-emerald-700 font-semibold">{a.zone || a.category}</p>
                    </div>
                    <span className="text-xs font-black text-stone-400 shrink-0">
                      {a.num || String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FRANJA DE ESTADÍSTICAS DEL PARQUE ── */}
      <section className="bg-[#0d2b1a] text-white border-t border-emerald-900 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <span className="text-5xl font-black text-white tracking-tight block mb-2">50+</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              {isEs ? "Especies Autóctonas" : "Native Species"}
            </span>
            <span className="text-xs text-emerald-200/70 font-medium">
              {isEs ? "Protegidas exclusivamente en Chiapas" : "Protected exclusively in Chiapas"}
            </span>
          </div>
          <div className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <span className="text-5xl font-black text-white tracking-tight block mb-2">100 ha</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              {isEs ? "Reserva El Zapotal" : "El Zapotal Reserve"}
            </span>
            <span className="text-xs text-emerald-200/70 font-medium">
              {isEs ? "Hábitat selvático natural preservado" : "Preserved natural jungle habitat"}
            </span>
          </div>
          <div className="p-6">
            <span className="text-5xl font-black text-white tracking-tight block mb-2">1942</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              {isEs ? "Fundado por Don Miguel Álvarez" : "Founded by Don Miguel Álvarez"}
            </span>
            <span className="text-xs text-emerald-200/70 font-medium">
              {isEs ? "Comprometidos con la conservación" : "Committed to wildlife conservation"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
