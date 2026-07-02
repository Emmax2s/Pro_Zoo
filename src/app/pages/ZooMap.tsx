import { MapPin, Info, Utensils, ShoppingBag, Heart, TreePine, Camera } from "lucide-react";

export function ZooMap() {
  const zones = [
    {
      name: "Zona de Felinos",
      icon: "🐆",
      color: "bg-orange-100 border-orange-500 text-orange-800",
      animals: ["Jaguar", "Ocelote", "Tigrillo"],
      location: "Entrada Norte"
    },
    {
      name: "Aviario Tropical",
      icon: "🦜",
      color: "bg-blue-100 border-blue-500 text-blue-800",
      animals: ["Guacamaya Roja", "Tucán Pico Iris", "Águila Arpía"],
      location: "Zona Central"
    },
    {
      name: "Primates",
      icon: "🐵",
      color: "bg-purple-100 border-purple-500 text-purple-800",
      animals: ["Mono Araña", "Mono Aullador", "Mono Capuchino"],
      location: "Zona Este"
    },
    {
      name: "Reptiles y Anfibios",
      icon: "🐊",
      color: "bg-green-100 border-green-600 text-green-800",
      animals: ["Cocodrilo de Pantano", "Boa Constrictor", "Tortuga Casquito"],
      location: "Zona Sur"
    },
    {
      name: "Herbívoros",
      icon: "🦌",
      color: "bg-amber-100 border-amber-500 text-amber-800",
      animals: ["Tapir", "Venado Cola Blanca", "Pecarí"],
      location: "Zona Oeste"
    },
    {
      name: "Zona Acuática",
      icon: "🦆",
      color: "bg-cyan-100 border-cyan-500 text-cyan-800",
      animals: ["Nutria", "Patos", "Garzas"],
      location: "Lago Central"
    }
  ];

  const facilities = [
    { icon: Utensils, name: "Cafetería", description: "Snacks y bebidas" },
    { icon: ShoppingBag, name: "Tienda de Souvenirs", description: "Recuerdos del ZooMAT" },
    { icon: Heart, name: "Primeros Auxilios", description: "Atención médica básica" },
    { icon: Info, name: "Centro de Información", description: "Mapas y guías" },
  ];

  const highlights = [
    {
      title: "Sendero Interpretativo",
      description: "Recorrido educativo de 2 km que atraviesa las principales zonas del zoológico",
      icon: TreePine,
      duration: "45-60 minutos"
    },
    {
      title: "Mirador Panorámico",
      description: "Vista espectacular del zoológico y la Selva El Zapotal",
      icon: Camera,
      duration: "10 minutos"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Mapa del ZooMAT</h1>
          <p className="text-xl text-green-100">
            Descubre las diferentes zonas y servicios de nuestro zoológico
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Mapa Visual */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-green-700" />
            <h2 className="text-3xl font-bold text-green-800">Plano General</h2>
          </div>

          {/* Mapa Placeholder */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-12 mb-6 min-h-[500px] flex items-center justify-center border-4 border-green-300">
            <div className="text-center">
              <MapPin className="w-24 h-24 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">Mapa Interactivo del ZooMAT</h3>
              <p className="text-green-700 max-w-md">
                El zoológico cuenta con 6 zonas temáticas distribuidas en 100 hectáreas de área natural protegida
              </p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {zones.map((zone, index) => (
              <div key={index} className={`${zone.color} border-2 rounded-lg p-3 text-center`}>
                <div className="text-3xl mb-1">{zone.icon}</div>
                <div className="font-semibold text-sm">{zone.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Zonas Detalladas */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Zonas Temáticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone, index) => (
              <div key={index} className={`${zone.color} border-2 rounded-lg p-6`}>
                <div className="text-5xl mb-3">{zone.icon}</div>
                <h3 className="font-bold text-xl mb-2">{zone.name}</h3>
                <div className="text-sm opacity-80 mb-3">
                  <MapPin className="inline w-3 h-3 mr-1" />
                  {zone.location}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm mb-1">Especies destacadas:</p>
                  {zone.animals.map((animal, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      {animal}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Servicios e Instalaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center border-2 border-green-200">
                <facility.icon className="w-12 h-12 text-green-700 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-800 mb-1">{facility.name}</h3>
                <p className="text-sm text-gray-600">{facility.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Puntos de Interés */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Puntos de Interés Especiales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-lg p-6">
                <highlight.icon className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-xl mb-2">{highlight.title}</h3>
                <p className="text-green-100 mb-3">{highlight.description}</p>
                <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-sm">
                  Duración aproximada: {highlight.duration}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-xl text-blue-900 mb-3">Consejos para tu Recorrido</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• El recorrido completo toma aproximadamente 2.5 a 3 horas</li>
                <li>• Recomendamos iniciar por la Zona de Felinos (cerca de la entrada)</li>
                <li>• Las mejores horas para ver a los animales activos son temprano en la mañana (9-11 AM)</li>
                <li>• Hay baños disponibles cerca de cada zona principal</li>
                <li>• Todos los senderos son accesibles para sillas de ruedas y carriolas</li>
                <li>• Solicita un mapa impreso gratuito en el Centro de Información</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
