import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import { Search, Filter, Volume2, MapPin, AlertCircle, X, Info, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimalCard } from "../components/AnimalCard";
import { useZoo } from "../context/ZooContext";

export function Animals() {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const { animals } = useZoo();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);

  // Detect URL parameter for QR scanning (e.g. /especie/1 or /animales?id=1)
  useEffect(() => {
    const targetId = params.id || searchParams.get("id");
    if (targetId && animals.length > 0) {
      const match = animals.find(
        (a) =>
          String(a.id) === String(targetId) ||
          a.name.toLowerCase().includes(String(targetId).toLowerCase())
      );
      if (match) {
        setSelectedAnimal(match);
      }
    }
  }, [params.id, searchParams, animals]);

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

  const [modalLang, setModalLang] = useState<'es' | 'en'>(isEs ? 'es' : 'en');

  const openAnimalModal = (animal: any) => {
    setModalLang(i18n.language === 'en' ? 'en' : 'es');
    setSelectedAnimal(animal);
  };

  const isModalEs = modalLang === 'es';

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
                onClick={() => openAnimalModal(animal)}
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

      {/* Modal de Detalle de Especie con Conmutador de Idioma (Español / Inglés) */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm" onClick={() => setSelectedAnimal(null)}>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-emerald-200" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal con Selector de Idioma */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 flex flex-wrap justify-between items-center gap-4 border-b-4 border-amber-400">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {isModalEs ? selectedAnimal.name : (selectedAnimal.nameEn || selectedAnimal.name)}
                </h2>
                <p className="text-emerald-200 italic font-semibold text-base mt-0.5">({selectedAnimal.scientificName})</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Conmutador Bilingüe de Idioma para el Modal */}
                <div className="flex items-center bg-emerald-950/80 p-1 rounded-full border border-emerald-700 shadow-inner">
                  <button
                    onClick={() => setModalLang('es')}
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                      isModalEs ? "bg-amber-400 text-emerald-950 shadow-md scale-105" : "text-emerald-200 hover:text-white"
                    }`}
                    title="Ver información en Español"
                  >
                    ES
                  </button>
                  <button
                    onClick={() => setModalLang('en')}
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                      !isModalEs ? "bg-amber-400 text-emerald-950 shadow-md scale-105" : "text-emerald-200 hover:text-white"
                    }`}
                    title="View information in English"
                  >
                    EN
                  </button>
                </div>

                <span className="bg-red-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
                  {isModalEs ? selectedAnimal.status : (selectedAnimal.statusEn || selectedAnimal.status)}
                </span>
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body Grid */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-stone-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {/* Left Column: Image & Audio Player */}
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl bg-stone-900 h-72">
                    <img
                      src={selectedAnimal.image}
                      alt={isModalEs ? selectedAnimal.name : (selectedAnimal.nameEn || selectedAnimal.name)}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Audio Player Section */}
                  <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
                      <Volume2 className="w-5 h-5 text-emerald-700" />
                      <span>{isModalEs ? "AUDIO DE LA ESPECIE" : "SPECIES AUDIO"}</span>
                    </div>

                    {selectedAnimal.audioUrl ? (
                      <audio controls className="w-full rounded-xl bg-stone-900 p-1">
                        <source src={selectedAnimal.audioUrl} />
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                    ) : (
                      <div className="bg-stone-100 text-stone-700 text-xs sm:text-sm p-4 rounded-xl font-medium border border-stone-200">
                        {isModalEs
                          ? "Grabación ambiental disponible en la estación educativa del parque."
                          : "Environmental recording available at park educational stations."}
                      </div>
                    )}

                    {selectedAnimal.audioUrl && (
                      <a
                        href={selectedAnimal.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-emerald-300 hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs"
                      >
                        {isModalEs ? "Abrir archivo de audio" : "Open audio file"}
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column: Information & Facts */}
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm uppercase tracking-wider mb-2.5 border-b border-stone-100 pb-2.5">
                      <Info className="w-5 h-5 text-emerald-700" />
                      <span>{isModalEs ? "SOBRE ESTA ESPECIE" : "ABOUT THIS SPECIES"}</span>
                    </div>
                    <p className="text-stone-800 text-base leading-relaxed font-medium">
                      {isModalEs ? selectedAnimal.funFact : (selectedAnimal.funFactEn || selectedAnimal.funFact)}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm uppercase tracking-wider mb-2.5 border-b border-stone-100 pb-2.5">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                      <span>{isModalEs ? "HÁBITAT & DISTRIBUCIÓN" : "HABITAT & DISTRIBUTION"}</span>
                    </div>
                    <p className="text-stone-800 text-base leading-relaxed font-medium">
                      {isModalEs ? selectedAnimal.habitat : (selectedAnimal.habitatEn || selectedAnimal.habitat)}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm uppercase tracking-wider mb-2.5 border-b border-stone-100 pb-2.5">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>{isModalEs ? "ALIMENTACIÓN" : "DIET"}</span>
                    </div>
                    <p className="text-stone-800 text-base leading-relaxed font-medium">
                      {isModalEs ? selectedAnimal.diet : (selectedAnimal.dietEn || selectedAnimal.diet)}
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
