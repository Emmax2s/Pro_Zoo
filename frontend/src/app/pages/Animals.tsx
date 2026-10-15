import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { Search, Filter, Volume2, MapPin, X, Info, Lightbulb, Globe, VolumeX, Mic, TreePine, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimalCard } from "../components/AnimalCard";
import { useZoo } from "../context/ZooContext";
import { recordSpeciesVisit } from "../services/analytics";
import { getLocalizedAnimal } from "../services/speciesTranslator";
import { playChime, speakNarration, stopAllAudio } from "../services/audioPlayer";

export function Animals() {
  const { animals, currentLang, toggleLanguage, setLanguage } = useZoo();
  const isEs = currentLang === "es";
  const { id: pathId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const qrLoggedRef = useRef<Record<string, boolean>>({});

  // Detect language query parameter if present
  useEffect(() => {
    const lang = searchParams.get("lang");
    if (lang === "es" || lang === "en") {
      setLanguage(lang);
    }
  }, [searchParams, setLanguage]);

  // Auto-open modal if scanned via QR or linked via URL parameter (/especie/:id or ?id=...)
  useEffect(() => {
    const targetId = pathId || searchParams.get("id") || searchParams.get("animal");
    if (targetId && animals.length > 0) {
      const found = animals.find(
        (a) =>
          String(a.id) === String(targetId) ||
          a.name.toLowerCase().includes(String(targetId).toLowerCase().replace(/-/g, " ")) ||
          a.scientificName.toLowerCase().includes(String(targetId).toLowerCase())
      );
      if (found) {
        setSelectedAnimal(found);

        // Record QR scan if flagged
        const isQr = searchParams.get("scan") === "qr" || window.location.search.includes("qr");
        if (isQr && !qrLoggedRef.current[String(found.id)]) {
          qrLoggedRef.current[String(found.id)] = true;
          recordSpeciesVisit(found.id, i18n.language, "qr");
        }
      }
    }
  }, [pathId, searchParams, animals, i18n.language]);

  // Stop speech when modal closes or unmounts
  const stopSpeech = useCallback(() => {
    stopAllAudio();
    setIsSpeaking(false);
  }, []);

  const closeModal = () => {
    stopSpeech();
    setSelectedAnimal(null);
    if (pathId) {
      navigate("/animales", { replace: true });
    }
  };

  const handleToggleModalLanguage = () => {
    stopSpeech();
    const nextLang = isEs ? "en" : "es";
    setLanguage(nextLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", nextLang);
    setSearchParams(newParams);
  };

  // Robust Text-to-Speech narrate species info in selected language
  const handleSpeakInfo = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    if (!selectedAnimal) return;

    const loc = getLocalizedAnimal(selectedAnimal, isEs);
    playChime();

    const name = loc.name;
    const scientific = loc.scientificName ? `(${loc.scientificName}).` : "";
    const aboutHeader = isEs ? "Sobre esta especie:" : "About this species:";
    const aboutText = loc.funFact;
    const habitatHeader = isEs ? "Hábitat y distribución:" : "Habitat and distribution:";
    const habitatText = loc.habitat;
    const dietHeader = isEs ? "Alimentación:" : "Diet:";
    const dietText = loc.diet;

    const fullSpeechText = `${name}. ${scientific} ${aboutHeader} ${aboutText}. ${habitatHeader} ${habitatText}. ${dietHeader} ${dietText}.`;

    speakNarration(
      fullSpeechText,
      isEs,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const categories = isEs
    ? ["Todos", "Mamífero", "Ave", "Reptil", "Anfibio"]
    : ["All", "Mammal", "Bird", "Reptile", "Amphibian"];

  const statuses = isEs
    ? ["Todos", "En Peligro de Extinción", "Amenazada", "Protegida Especial"]
    : ["All", "Endangered", "Threatened", "Special Protection"];

  const isCategorySelected = (cat: string) => {
    if (cat === "Todos" || cat === "All") {
      return selectedCategory === "Todos" || selectedCategory === "All";
    }
    return (
      selectedCategory.toLowerCase() === cat.toLowerCase() ||
      (cat === "Mammal" && selectedCategory === "Mamífero") ||
      (cat === "Mamífero" && selectedCategory === "Mammal") ||
      (cat === "Bird" && selectedCategory === "Ave") ||
      (cat === "Ave" && selectedCategory === "Bird") ||
      (cat === "Reptile" && selectedCategory === "Reptil") ||
      (cat === "Reptil" && selectedCategory === "Reptile") ||
      (cat === "Amphibian" && selectedCategory === "Anfibio") ||
      (cat === "Anfibio" && selectedCategory === "Amphibian")
    );
  };

  const isStatusSelected = (st: string) => {
    if (st === "Todos" || st === "All") {
      return selectedStatus === "Todos" || selectedStatus === "All";
    }
    return (
      selectedStatus.toLowerCase() === st.toLowerCase() ||
      (st === "Endangered" && selectedStatus === "En Peligro de Extinción") ||
      (st === "En Peligro de Extinción" && selectedStatus === "Endangered") ||
      (st === "Threatened" && selectedStatus === "Amenazada") ||
      (st === "Amenazada" && selectedStatus === "Threatened") ||
      (st === "Special Protection" && selectedStatus === "Protegida Especial") ||
      (st === "Protegida Especial" && selectedStatus === "Special Protection")
    );
  };

  const filteredAnimals = animals.filter((animal) => {
    const loc = getLocalizedAnimal(animal, isEs);
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.scientificName.toLowerCase().includes(searchTerm.toLowerCase());

    const isAllCat = selectedCategory === "Todos" || selectedCategory === "All";
    const matchesCategory =
      isAllCat ||
      animal.category === selectedCategory ||
      loc.category === selectedCategory ||
      isCategorySelected(animal.category || "");

    const isAllStat = selectedStatus === "Todos" || selectedStatus === "All";
    const matchesStatus =
      isAllStat ||
      animal.status === selectedStatus ||
      loc.status === selectedStatus ||
      isStatusSelected(animal.status || "");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedLoc = selectedAnimal ? getLocalizedAnimal(selectedAnimal, isEs) : null;

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 pb-20">
      {/* 1. Header Banner matching photo 1 style */}
      <section className="relative bg-[#f7f3e8] border-b-4 border-[#2b1706] py-14 md:py-20 overflow-hidden">
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
              <span>ZOOLÓGICO REGIONAL MIGUEL ÁLVAREZ DEL TORO</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.1] text-adventure-shadow">
              {isEs ? "Catálogo de Fauna Nativa" : "Native Wildlife Catalog"}
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              {isEs
                ? "Explora la increíble diversidad de fauna protegida en el ZooMAT a través de nuestro catálogo interactivo y audioguías oficiales."
                : "Explore the incredible diversity of protected wildlife at ZooMAT through our interactive catalog and official audio guides."}
            </p>
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-5 sm:h-6 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-10" />
      </section>

      {/* 2. Filters Box with Adventure Styling */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border-2 border-[#e2d5bd] rounded-3xl shadow-xl p-6 md:p-8">
          {/* Search Input */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-700" />
              <input
                type="text"
                placeholder={
                  isEs
                    ? "Buscar especie por nombre común o científico..."
                    : "Search species by common or scientific name..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-[#fcfaf5] border-2 border-amber-900/20 rounded-2xl text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-base font-semibold"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="flex items-center text-sm font-black text-amber-900 uppercase tracking-widest mb-4">
                <Filter className="w-4 h-4 mr-2 text-amber-700" />
                {isEs ? "Categoría" : "Category"}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      isCategorySelected(category)
                        ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                        : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 border border-amber-900/20"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="flex items-center text-sm font-black text-amber-900 uppercase tracking-widest mb-4">
                <Filter className="w-4 h-4 mr-2 text-amber-700" />
                {isEs ? "Estado de Conservación" : "Conservation Status"}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      isStatusSelected(status)
                        ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                        : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 border border-amber-900/20"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-base text-stone-700 font-bold px-2">
          <p>
            {isEs ? "Mostrando " : "Showing "}
            <span className="font-adventure text-lg text-amber-950 bg-amber-200/80 px-3 py-1 rounded-lg border border-amber-400">
              {filteredAnimals.length}
            </span>
            {isEs ? " especies nativas encontradas" : " native species found"}
          </p>
        </div>
      </section>

      {/* 3. Animals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnimals.map((animal) => {
              const loc = getLocalizedAnimal(animal, isEs);
              return (
                <div
                  key={animal.id}
                  onClick={() => setSelectedAnimal(animal)}
                  className="cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
                >
                  <AnimalCard
                    name={loc.name}
                    scientificName={loc.scientificName}
                    image={animal.image}
                    habitat={loc.habitat}
                    diet={loc.diet}
                    status={loc.status}
                    funFact={loc.funFact}
                    statusColor={
                      animal.status === "En Peligro de Extinción" || loc.status === "Endangered"
                        ? "bg-rose-700 text-white"
                        : animal.status === "Amenazada" || loc.status === "Threatened"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-700 text-white"
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-amber-300 bg-white rounded-3xl p-16 text-center shadow-lg">
            <p className="text-stone-800 font-bold mb-6 text-xl">
              {isEs
                ? "No se encontraron animales con los filtros seleccionados."
                : "No animals found with the selected filters."}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(categories[0]);
                setSelectedStatus(statuses[0]);
              }}
              className="wood-texture-bg text-amber-200 hover:text-white px-8 py-3.5 rounded-2xl text-base font-adventure border-2 border-amber-600 shadow-md hover:scale-105 transition-all wood-button-shadow"
            >
              {isEs ? "Limpiar Filtros" : "Clear Filters"}
            </button>
          </div>
        )}
      </section>

      {/* 4. Modal de Detalle de Especie con Estilo Aventura */}
      {selectedAnimal && selectedLoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border-4 border-[#2b1706]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal con Textura Madera */}
            <div className="wood-texture-bg text-amber-100 p-6 flex flex-wrap justify-between items-center gap-4 border-b-4 border-amber-700 shadow-lg">
              <div>
                <h2 className="font-adventure text-3xl sm:text-4xl text-amber-200 text-adventure-shadow">
                  {selectedLoc.name}
                </h2>
                <p className="text-amber-300 italic font-medium text-lg mt-0.5 font-serif">
                  ({selectedLoc.scientificName})
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Botón de Cambio de Idioma */}
                <button
                  onClick={handleToggleModalLanguage}
                  className="bg-white/90 hover:bg-white text-stone-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md border-2 border-amber-400 transition-transform hover:scale-105 cursor-pointer"
                  title="Cambiar idioma del modal / Switch modal language"
                >
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>{isEs ? "ENGLISH" : "ESPAÑOL"}</span>
                </button>

                <span className="bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-black uppercase px-3.5 py-1.5 rounded-full shadow-xs">
                  {selectedLoc.status}
                </span>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-amber-200 transition-colors cursor-pointer border border-amber-500/40"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-[#faf8f2]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Image & Audio */}
                <div className="space-y-6">
                  <div className="rounded-3xl overflow-hidden border-4 border-amber-950 shadow-xl bg-stone-900 h-72 sm:h-80">
                    <img
                      src={selectedAnimal.image}
                      alt={selectedLoc.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Mode Voice / Lectura en Voz Alta */}
                  <div className="bg-gradient-to-r from-amber-950 via-[#8B5A2B] to-[#5C3A1E] text-white rounded-2xl p-5 shadow-lg flex items-center justify-between border-2 border-amber-600/70">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-400 text-stone-950 rounded-xl font-bold shadow-md">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-adventure text-lg text-amber-200">
                          {isEs ? "Modo Voz Narradora" : "Voice Reader Mode"}
                        </p>
                        <p className="text-xs text-amber-100/90 font-medium">
                          {isSpeaking
                            ? isEs
                              ? "Reproduciendo narración de voz..."
                              : "Playing voice narration..."
                            : isEs
                            ? "Escucha la narración oficial"
                            : "Listen to official narration"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSpeakInfo}
                      className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isSpeaking
                          ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                          : "bg-amber-400 hover:bg-amber-300 text-stone-950 hover:scale-105"
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      <span>{isSpeaking ? (isEs ? "Detener" : "Stop") : isEs ? "Escuchar" : "Listen"}</span>
                    </button>
                  </div>

                  {/* Native Audio */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#e2d5bd] shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 font-black text-sm uppercase tracking-wider">
                      <Volume2 className="w-5 h-5 text-amber-700" />
                      <span>{isEs ? "AUDIO DE LA ESPECIE" : "SPECIES AUDIO"}</span>
                    </div>

                    {selectedLoc.audioUrl ? (
                      <audio
                        controls
                        className="w-full rounded-xl bg-stone-900 p-2 text-white"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const errBox = document.getElementById("audio-fallback-msg");
                          if (errBox) errBox.style.display = "block";
                        }}
                      >
                        <source src={selectedLoc.audioUrl} />
                        {isEs
                          ? "Tu navegador no soporta el reproductor."
                          : "Your browser does not support audio."}
                      </audio>
                    ) : null}

                    <div
                      id="audio-fallback-msg"
                      className={`${
                        selectedLoc.audioUrl ? "hidden" : "block"
                      } bg-[#fcfaf5] text-stone-700 text-xs font-semibold p-3.5 rounded-xl border border-amber-900/15`}
                    >
                      {isEs
                        ? "Audio interactivo disponible a través del botón 'Escuchar' del Modo Voz Narradora arriba."
                        : "Interactive audio available via the 'Listen' button in Voice Reader Mode above."}
                    </div>
                  </div>
                </div>

                {/* Right Column: Information & Facts Localized */}
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#e2d5bd] shadow-sm">
                    <div className="flex items-center gap-2 text-stone-900 font-adventure text-lg tracking-wide mb-3 border-b border-amber-900/10 pb-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>{isEs ? "SOBRE ESTA ESPECIE" : "ABOUT THIS SPECIES"}</span>
                    </div>
                    <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                      {selectedLoc.funFact}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border-2 border-[#e2d5bd] shadow-sm">
                    <div className="flex items-center gap-2 text-stone-900 font-adventure text-lg tracking-wide mb-3 border-b border-amber-900/10 pb-2">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                      <span>{isEs ? "HÁBITAT & DISTRIBUCIÓN" : "HABITAT & DISTRIBUTION"}</span>
                    </div>
                    <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                      {selectedLoc.habitat}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border-2 border-[#e2d5bd] shadow-sm">
                    <div className="flex items-center gap-2 text-stone-900 font-adventure text-lg tracking-wide mb-3 border-b border-amber-900/10 pb-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      <span>{isEs ? "ALIMENTACIÓN & DIETA" : "DIET & NUTRITION"}</span>
                    </div>
                    <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                      {selectedLoc.diet}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
