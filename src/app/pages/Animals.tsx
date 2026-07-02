import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { AnimalCard } from "../components/AnimalCard";

const allAnimals = [
  {
    name: 'Jaguar',
    scientificName: 'Panthera onca',
    image: '/assets/images/jaguar.svg',
    habitat: 'Selvas tropicales y bosques húmedos de Chiapas',
    diet: 'Carnívoro: pecaríes, venados, tapires, aves y reptiles',
    status: 'En Peligro de Extinción',
    statusColor: 'bg-red-100 text-red-800',
    funFact: 'El jaguar tiene la mordida más fuerte de todos los felinos y puede romper el caparazón de una tortuga.',
    category: 'Mamífero',
  },
  {
    name: 'Tucán Pico Iris',
    scientificName: 'Ramphastos sulfuratus',
    image: '/assets/images/toucan.svg',
    habitat: 'Selva tropical húmeda, desde el sur de México hasta Colombia',
    diet: 'Omnívoro: frutas, insectos, huevos y pequeños vertebrados',
    status: 'Amenazada',
    statusColor: 'bg-yellow-100 text-yellow-800',
    funFact: 'Su pico grande y colorido representa el 30% de su longitud total, pero es muy ligero gracias a su estructura hueca.',
    category: 'Ave',
  },
  {
    name: 'Tapir Centroamericano',
    scientificName: 'Tapirus bairdii',
    image: '/assets/images/tapir.svg',
    habitat: 'Bosques tropicales y humedales del sur de México',
    diet: 'Herbívoro: hojas, frutas, ramas y plantas acuáticas',
    status: 'En Peligro de Extinción',
    statusColor: 'bg-red-100 text-red-800',
    funFact: 'Son excelentes nadadores y pueden sumergirse completamente en el agua para escapar de depredadores.',
    category: 'Mamífero',
  },
  {
    name: 'Mono Araña',
    scientificName: 'Ateles geoffroyi',
    image: '/assets/images/monkey.svg',
    habitat: 'Selvas tropicales del sureste mexicano',
    diet: 'Omnívoro principalmente frugívoro: frutas, flores, semillas e insectos',
    status: 'En Peligro de Extinción',
    statusColor: 'bg-red-100 text-red-800',
    funFact: 'Su cola prensil actúa como una "quinta mano" y es tan fuerte que pueden colgarse solo de ella.',
    category: 'Mamífero',
  },
  {
    name: 'Guacamaya Roja',
    scientificName: 'Ara macao',
    image: '/assets/images/macaw.svg',
    habitat: 'Selvas tropicales húmedas de Chiapas',
    diet: 'Herbívoro: frutas, nueces, semillas y flores',
    status: 'Amenazada',
    statusColor: 'bg-yellow-100 text-yellow-800',
    funFact: 'Forman parejas de por vida y pueden vivir hasta 50 años en su hábitat natural.',
    category: 'Ave',
  },
  {
    name: 'Cocodrilo de Pantano',
    scientificName: 'Crocodylus moreletii',
    image: '/assets/images/rocodile.svg',
    habitat: 'Ríos, lagos y pantanos de Chiapas y la costa del Golfo',
    diet: 'Carnívoro: peces, aves, mamíferos pequeños y crustáceos',
    status: 'Protegida Especial',
    statusColor: 'bg-orange-100 text-orange-800',
    funFact: 'Es el cocodrilo más pequeño de México, alcanzando un máximo de 3 metros de longitud.',
    category: 'Reptil',
  },
];

export function Animals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");

  const categories = ["Todos", "Mamífero", "Ave", "Reptil"];
  const statuses = ["Todos", "En Peligro de Extinción", "Amenazada", "Protegida Especial"];

  const filteredAnimals = allAnimals.filter((animal) => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || animal.category === selectedCategory;
    const matchesStatus = selectedStatus === "Todos" || animal.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-emerald-50/30">
      {/* Header */}
      <section className="bg-white border-b border-emerald-100 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-emerald-950 tracking-tight">Nuestros Animales</h1>
          <p className="text-lg text-emerald-800/70 max-w-2xl font-medium">
            Explora la increíble diversidad de fauna nativa de Chiapas a través de nuestro catálogo interactivo.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border border-emerald-100 rounded-3xl shadow-sm p-6 md:p-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                placeholder="Buscar especie por nombre común o científico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="flex items-center text-xs font-bold text-emerald-700/70 uppercase tracking-widest mb-4">
                <Filter className="w-3.5 h-3.5 mr-2" />
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      selectedCategory === category
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 border border-emerald-700"
                        : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="flex items-center text-xs font-bold text-emerald-700/70 uppercase tracking-widest mb-4">
                <Filter className="w-3.5 h-3.5 mr-2" />
                Estado de Conservación
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      selectedStatus === status
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 border border-emerald-700"
                        : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-between text-sm text-emerald-600 font-medium px-2">
          <p>Mostrando <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">{filteredAnimals.length}</span> resultados</p>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnimals.map((animal, index) => (
              <AnimalCard key={index} {...animal} />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-3xl p-16 text-center">
            <p className="text-emerald-800 font-medium mb-6 text-lg">
              No se encontraron animales con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
                setSelectedStatus("Todos");
              }}
              className="bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-700/20"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
