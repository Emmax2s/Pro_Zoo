import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { Search, Filter, Volume2, MapPin, X, Info, Lightbulb, Globe, VolumeX, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimalCard } from "../components/AnimalCard";
import { useZoo } from "../context/ZooContext";

export function Animals() {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const { animals } = useZoo();
  const { id: pathId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-open modal if scanned via QR or linked via URL parameter (/especie/:id or ?id=...)
  useEffect(() => {
    const targetId = pathId || searchParams.get('id') || searchParams.get('animal');
    if (targetId && animals.length > 0) {
      const found = animals.find(
        (a) =>
          String(a.id) === String(targetId) ||
          a.name.toLowerCase().includes(String(targetId).toLowerCase().replace(/-/g, ' ')) ||
          a.scientificName.toLowerCase().includes(String(targetId).toLowerCase())
      );
      if (found) {
        setSelectedAnimal(found);
      }
    }
  }, [pathId, searchParams, animals]);

  // Stop speech synthesis when modal closes or unmounts
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const closeModal = () => {
    stopSpeech();
    setSelectedAnimal(null);
    if (pathId) {
      navigate('/animales', { replace: true });
    }
  };

  const toggleLanguage = () => {
    stopSpeech();
    i18n.changeLanguage(isEs ? 'en' : 'es');
  };

  // Text-to-Speech narrate species info in selected language
  const handleSpeakInfo = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(isEs ? "Tu navegador no soporta lectura de voz." : "Your browser does not support text-to-speech.");
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    if (!selectedAnimal) return;

    const name = isEs ? selectedAnimal.name : (selectedAnimal.nameEn || selectedAnimal.name);
    const scientific = selectedAnimal.scientificName ? `(${selectedAnimal.scientificName}).` : '';
    const aboutHeader = isEs ? "Sobre esta especie:" : "About this species:";
    const aboutText = isEs ? selectedAnimal.funFact : (selectedAnimal.funFactEn || selectedAnimal.funFact);
    const habitatHeader = isEs ? "Hábitat y distribución:" : "Habitat and distribution:";
    const habitatText = isEs ? selectedAnimal.habitat : (selectedAnimal.habitatEn || selectedAnimal.habitat);
    const dietHeader = isEs ? "Alimentación:" : "Diet:";
    const dietText = isEs ? selectedAnimal.diet : (selectedAnimal.dietEn || selectedAnimal.diet);

    const fullSpeechText = `${name}. ${scientific} ${aboutHeader} ${aboutText}. ${habitatHeader} ${habitatText}. ${dietHeader} ${dietText}.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.lang = isEs ? 'es-MX' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const categories = isEs
    ? ["Todos", "Mamífero", "Ave", "Reptil", "Anfibio"]
    : ["All", "Mammal", "Bird", "Reptile", "Amphibian"];

  const statuses = isEs
    ? ["Todos", "En Peligro de Extinción", "Amenazada", "Protegida Especial"]
    : ["All", "Endangered", "Threatened", "Special Protection"];

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isAllCat = selectedCategory === "Todos" || selectedCategory === "All";
    const matchesCategory = isAllCat || animal.category === selectedCategory;
    
    const isAllStat = selectedStatus === "Todos" || selectedStatus === "All";
    const matchesStatus = isAllStat || animal.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-stone-50 to-emerald-100/30">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white py-16 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {isEs ? "Catálogo de Fauna Nativa" : "Native Wildlife Catalog"}
          </h1>
          <p className="text-lg text-emerald-100/90 max-w-2xl font-medium">
            {isEs
              ? "Explora la increíble diversidad de fauna protegida en el ZooMAT a través de nuestro catálogo bilingüe interactivo."
              : "Explore the incredible diversity of protected wildlife at ZooMAT through our interactive bilingual catalog."}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white border border-emerald-100 rounded-3xl shadow-lg p-6 md:p-8">
          {/* Search Input */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                placeholder={isEs ? "Buscar especie por nombre común o científico..." : "Search species by common or scientific name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-emerald-950 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="flex items-center text-xs font-bold text-emerald-700/80 uppercase tracking-widest mb-4">
                <Filter className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                {isEs ? "Categoría" : "Category"}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === category
                        ? "bg-emerald-800 text-white shadow-md border border-emerald-800"
                        : "bg-stone-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="flex items-center text-xs font-bold text-emerald-700/80 uppercase tracking-widest mb-4">
                <Filter className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                {isEs ? "Estado de Conservación" : "Conservation Status"}
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedStatus === status
                        ? "bg-emerald-800 text-white shadow-md border border-emerald-800"
                        : "bg-stone-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/80"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-emerald-700 font-medium px-2">
          <p>
            {isEs ? "Mostrando " : "Showing "}
            <span className="font-bold text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-lg">{filteredAnimals.length}</span>
            {isEs ? " especies encontradas" : " species found"}
          </p>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnimals.map((animal) => (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                className="cursor-pointer transform transition-transform duration-300 hover:-translate-y-1"
              >
                <AnimalCard {...animal} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-emerald-200 bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center shadow-md">
            <p className="text-emerald-900 font-semibold mb-6 text-lg">
              {isEs ? "No se encontraron animales con los filtros seleccionados." : "No animals found with the selected filters."}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(categories[0]);
                setSelectedStatus(statuses[0]);
              }}
              className="bg-emerald-800 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-colors shadow-md"
            >
              {isEs ? "Limpiar Filtros" : "Clear Filters"}
            </button>
          </div>
        )}
      </section>

      {/* Modal de Detalle de Especie con Reproductor de Audio e Idioma Bilingüe */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal con Selector de Idioma (Photo 2 Fix) */}
            <div className="bg-emerald-900 text-white p-6 flex flex-wrap justify-between items-center gap-4 border-b-4 border-amber-400">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black">{isEs ? selectedAnimal.name : (selectedAnimal.nameEn || selectedAnimal.name)}</h2>
                <p className="text-amber-300 italic font-medium text-base mt-0.5">({selectedAnimal.scientificName})</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Botón de Cambio de Idioma (ES / EN) directamente en el Modal */}
                <button
                  onClick={toggleLanguage}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-4 py-2 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md border-2 border-amber-300 transition-transform hover:scale-105 cursor-pointer"
                  title="Cambiar idioma del modal / Switch modal language"
                >
                  <Globe className="w-4 h-4 text-emerald-950" />
                  <span>{isEs ? "ENGLISH | ESPAÑOL" : "ESPAÑOL | ENGLISH"}</span>
                </button>

                <span className="bg-emerald-950 border border-emerald-700 text-amber-300 text-xs font-black uppercase px-3.5 py-1.5 rounded-full shadow-xs">
                  {isEs ? selectedAnimal.status : (selectedAnimal.status === "En Peligro de Extinción" ? "Endangered" : selectedAnimal.status === "Amenazada" ? "Threatened" : "Special Protection")}
                </span>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body Grid */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-stone-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Image, In-Place Audio Player & Text-to-Speech */}
                <div className="space-y-6">
                  <div className="rounded-3xl overflow-hidden border-4 border-emerald-800 shadow-lg bg-stone-900 h-72 sm:h-80">
                    <img
                      src={selectedAnimal.image}
                      alt={selectedAnimal.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Mode Voice / Lectura en Voz Alta (Text to Speech) */}
                  <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-md flex items-center justify-between border-2 border-emerald-700">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-400 text-emerald-950 rounded-xl font-bold shadow-sm">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm sm:text-base text-amber-300">
                          {isEs ? "Modo Voz Narradora" : "Voice Reader Mode"}
                        </p>
                        <p className="text-xs text-emerald-100/90 font-medium">
                          {isSpeaking
                            ? (isEs ? "Leyendo información en voz alta..." : "Reading information out loud...")
                            : (isEs ? "Escucha la información de esta especie" : "Listen to this species information")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSpeakInfo}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isSpeaking
                          ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                          : "bg-amber-400 hover:bg-amber-300 text-emerald-950 hover:scale-105"
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? (isEs ? "Detener" : "Stop") : (isEs ? "Escuchar" : "Listen")}</span>
                    </button>
                  </div>

                  {/* Audio Player Section (Reproduce en el apartado sin abrir nueva página) */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
                      <Volume2 className="w-5 h-5 text-emerald-700" />
                      <span>{isEs ? "AUDIO DE LA ESPECIE (NATIVO)" : "SPECIES AUDIO (NATIVE)"}</span>
                    </div>

                    {selectedAnimal.audioUrl ? (
                      <audio controls className="w-full rounded-xl bg-emerald-950 p-2 text-white">
                        <source src={selectedAnimal.audioUrl} />
                        {isEs ? "Tu navegador no soporta el elemento de audio." : "Your browser does not support the audio element."}
                      </audio>
                    ) : (
                      <div className="bg-stone-100 text-stone-700 text-xs font-semibold p-3.5 rounded-xl border border-stone-200">
                        {isEs ? "Audio ilustrativo disponible a través del botón 'Escuchar' del Modo Voz Narradora arriba." : "Illustrative audio available via the 'Listen' button in Voice Reader Mode above."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Information & Facts */}
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider mb-3 border-b border-stone-100 pb-2">
                      <Info className="w-5 h-5 text-emerald-700" />
                      <span>{isEs ? "SOBRE ESTA ESPECIE" : "ABOUT THIS SPECIES"}</span>
                    </div>
                    <p className="text-stone-800 text-base font-medium leading-relaxed">
                      {isEs ? selectedAnimal.funFact : (selectedAnimal.funFactEn || selectedAnimal.funFact)}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider mb-3 border-b border-stone-100 pb-2">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                      <span>{isEs ? "HÁBITAT & DISTRIBUCIÓN" : "HABITAT & DISTRIBUTION"}</span>
                    </div>
                    <p className="text-stone-800 text-base font-medium leading-relaxed">
                      {isEs ? selectedAnimal.habitat : (selectedAnimal.habitatEn || selectedAnimal.habitat)}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider mb-3 border-b border-stone-100 pb-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>{isEs ? "ALIMENTACIÓN" : "DIET"}</span>
                    </div>
                    <p className="text-stone-800 text-base font-medium leading-relaxed">
                      {isEs ? selectedAnimal.diet : (selectedAnimal.dietEn || selectedAnimal.diet)}
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
