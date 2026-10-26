import {
  MapPin,
  Info,
  Utensils,
  ShoppingBag,
  Heart,
  TreePine,
  Camera,
  Compass,
  ExternalLink,
  Navigation,
  PawPrint,
  Feather,
  Trees,
  ShieldAlert,
  Clock,
  Sun,
  Building,
  Accessibility,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useZoo } from "../context/ZooContext";

export function ZooMap() {
  const { t } = useTranslation();
  const { currentLang } = useZoo();
  const isEs = currentLang === "es";
  const [activeTab, setActiveTab] = useState<string>("all");

  const zones = [
    {
      id: "felinos",
      name: isEs ? "Zona de Felinos" : "Feline Zone",
      icon: PawPrint,
      color: "bg-amber-50/90 border-amber-400 text-amber-950",
      badgeColor: "bg-amber-600 text-white",
      animals: ["Jaguar", "Ocelote", "Tigrillo", "Puma"],
      location: isEs ? "Entrada Norte" : "North Entrance",
      desc: isEs
        ? "Especies de felinos autÛctonos protegidos en recintos naturales adaptados a su entorno selv·tico."
        : "Native feline species protected in natural enclosures adapted to their jungle environment.",
    },
    {
      id: "aviario",
      name: isEs ? "Aviario Tropical" : "Tropical Aviary",
      icon: Feather,
      color: "bg-sky-50/90 border-sky-400 text-sky-950",
      badgeColor: "bg-sky-600 text-white",
      animals: ["Guacamaya Roja", "Tuc·n Pico Iris", "¡guila ArpÌa", "Quetzal"],
      location: isEs ? "Zona Central" : "Central Zone",
      desc: isEs
        ? "Gran estructura inmersiva para observar aves en vuelo libre y vegetaciÛn tropical densa."
        : "Large immersive structure to observe free-flying birds and dense tropical flora.",
    },
    {
      id: "primates",
      name: isEs ? "Isla de Primates" : "Primate Island",
      icon: Trees,
      color: "bg-purple-50/90 border-purple-400 text-purple-950",
      badgeColor: "bg-purple-600 text-white",
      animals: ["Mono AraÒa", "Mono Aullador (Saraguato)", "Mono Capuchino"],
      location: isEs ? "Zona Este" : "East Zone",
      desc: isEs
        ? "H·bitats arbolados rodeados de agua para la conservaciÛn y bienestar de primates nativos."
        : "Wooded habitats surrounded by water for native primate welfare and conservation.",
    },
    {
      id: "reptiles",
      name: isEs ? "Herpetario & Cocodrilario" : "Reptile & Crocodile Center",
      icon: ShieldAlert,
      color: "bg-emerald-50/90 border-emerald-400 text-emerald-950",
      badgeColor: "bg-emerald-700 text-white",
      animals: ["Cocodrilo de Pantano", "Boa Constrictor", "Iguana Verde", "Tortuga Casquito"],
      location: isEs ? "Zona Sur" : "South Zone",
      desc: isEs
        ? "Espacio especializado en anfibios, reptiles y conservaciÛn de caimanes de rÌos chiapanecos."
        : "Specialized facility for amphibians, reptiles, and river crocodiles of Chiapas.",
    },
    {
      id: "herbivoros",
      name: isEs ? "Reserva de HerbÌvoros" : "Herbivore Reserve",
      icon: Compass,
      color: "bg-orange-50/90 border-orange-400 text-orange-950",
      badgeColor: "bg-orange-600 text-white",
      animals: ["Tapir Centroamericano", "Venado Cola Blanca", "PecarÌ de Collar"],
      location: isEs ? "Zona Oeste" : "West Zone",
      desc: isEs
        ? "Senderos amplios para observar grandes mamÌferos herbÌvoros en semilibertad."
        : "Spacious trails to observe large herbivorous mammals in expansive natural enclosures.",
    },
  ];

  const facilities = [
    {
      name: isEs ? "Taquillas y Accesos" : "Ticket Booth & Entrance",
      icon: Building,
      description: isEs ? "Entrada principal y mÛdulos de informaciÛn turÌstica" : "Main entrance and visitor info desks",
    },
    {
      name: isEs ? "¡rea de Alimentos" : "Cafeteria & Snacks",
      icon: Utensils,
      description: isEs ? "CafeterÌa con bebidas frescas y comida regional" : "Cafeteria with cold drinks and local food",
    },
    {
      name: isEs ? "Servicios Sanitarios" : "Restrooms",
      icon: Accessibility,
      description: isEs ? "MÛdulos de sanitarios limpios distribuidos en el sendero" : "Clean restroom stations along the trails",
    },
    {
      name: isEs ? "Primeros Auxilios" : "First Aid",
      icon: Heart,
      description: isEs ? "Puesto de atenciÛn mÈdica inmediata para visitantes" : "Medical aid station for visitor safety",
    },
  ];

  const highlights = [
    {
      title: isEs ? "Sendero Interpretativo El Zapotal" : "El Zapotal Interpretive Trail",
      description: isEs
        ? "Recorrido empedrado de 2.5 km en plena selva baja que conecta todas las exhibiciones de fauna nativa."
        : "A 2.5 km cobblestone path through low jungle connecting all native wildlife exhibits.",
      icon: TreePine,
      duration: isEs ? "90-120 minutos" : "90-120 minutes",
    },
    {
      title: isEs ? "Mirador Panor·mico de Canopia" : "Canopy Panoramic Lookout",
      description: isEs
        ? "Vista espectacular de la vegetaciÛn nativa y el relieve de Tuxtla GutiÈrrez."
        : "Spectacular view of native vegetation and Tuxtla GutiÈrrez landscape.",
      icon: Camera,
      duration: isEs ? "15-20 minutos" : "15-20 minutes",
    },
  ];
  const googleMapsDirectionsUrl =
    "https://www.google.com/maps/dir//Zool%C3%B3gico+Regional+Miguel+%C3%81lvarez+del+Toro,+Calz.+Cerro+Hueco+s%2Fn,+El+Zapotal,+29094+Tuxtla+Guti%C3%A9rrez,+Chis./";

  const filteredZones = activeTab === "all" ? zones : zones.filter((z) => z.id === activeTab);

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
              <span>ZOOL√ìGICO REGIONAL MIGUEL √ÅLVAREZ DEL TORO</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.15]">
              {t("mapPage.title")}
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              {t("mapPage.subtitle")}
            </p>
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-5 sm:h-6 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-10" />
      </section>

      {/* 2. Main Map Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* GPS Button Banner */}
        <div className="wood-texture-bg rounded-3xl p-8 text-amber-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border-4 border-amber-600">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-amber-400 text-stone-950 shadow-lg">
              <Navigation className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-adventure text-2xl sm:text-3xl text-amber-200">
                {isEs ? "¬øVienes en camino al ZooMAT?" : "Navigating to ZooMAT?"}
              </h3>
              <p className="text-amber-100/90 text-base sm:text-lg font-medium">
                {isEs
                  ? "Abre la ruta en tiempo real directamente en tu aplicaci√≥n de navegaci√≥n GPS."
                  : "Open real-time route directly in your GPS navigation app."}
              </p>
            </div>
          </div>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-adventure text-lg tracking-wide shadow-xl hover:scale-105 transition-all text-center flex-shrink-0"
          >
            {isEs ? "Abrir en Google Maps" : "Open in Google Maps"}
          </a>
        </div>

        {/* Zonas Tem√°ticas */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide mb-2">
                {t("mapPage.zonesTitle")}
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-medium">
                {isEs
                  ? "Filtra y explora las distintas zonas de conservaci√≥n dentro del sendero de 2.5 km."
                  : "Filter and explore the different conservation habitats along the 2.5 km trail."}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                    : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 border border-amber-900/20"
                }`}
              >
                {isEs ? "Todas las zonas" : "All zones"}
              </button>
              {zones.map((z) => {
                const IconComp = z.icon;
                return (
                  <button
                    key={z.id}
                    onClick={() => setActiveTab(z.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === z.id
                        ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                        : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 border border-amber-900/20"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{z.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredZones.map((zone, index) => {
              const ZoneIcon = zone.icon;
              return (
                <div
                  key={index}
                  className={`${zone.color} border-2 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/80 rounded-2xl shadow-xs">
                        <ZoneIcon className="w-6 h-6 text-stone-900" />
                      </div>
                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs ${zone.badgeColor}`}>
                        {zone.location}
                      </span>
                    </div>
                    <h3 className="font-adventure text-2xl sm:text-3xl mb-2 text-[#2b1810]">{zone.name}</h3>
                    <p className="text-base font-medium opacity-90 mb-5 leading-relaxed">{zone.desc}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-black/10">
                    <p className="font-adventure text-xs uppercase tracking-wider text-[#2b1810]">
                      {isEs ? "Especies protegidas:" : "Featured species:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {zone.animals.map((animal, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-black/10 shadow-xs text-stone-900"
                        >
                          {animal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Puntos de Inter√©s */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] mb-6">
            {isEs ? "Senderos y Miradores Destacados" : "Featured Trails & Lookouts"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="wood-texture-bg text-amber-100 rounded-3xl p-7 shadow-lg border-2 border-amber-600 flex flex-col justify-between"
              >
                <div>
                  <highlight.icon className="w-10 h-10 mb-4 text-amber-400" />
                  <h3 className="font-adventure text-2xl sm:text-3xl text-amber-200 mb-2">{highlight.title}</h3>
                  <p className="text-amber-100/90 text-base sm:text-lg mb-5 leading-relaxed font-medium">
                    {highlight.description}
                  </p>
                </div>
                <div className="bg-black/40 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-300 border border-amber-500/30 w-fit">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{isEs ? "Duraci√≥n aprox:" : "Approx duration:"} {highlight.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] mb-6">{t("mapPage.servicesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="bg-[#fcfaf5] rounded-2xl p-6 text-center border-2 border-amber-900/10 shadow-xs"
              >
                <div className="wood-texture-bg w-16 h-16 rounded-2xl text-amber-200 border border-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <facility.icon className="w-8 h-8" />
                </div>
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2">{facility.name}</h3>
                <p className="text-stone-700 text-sm font-medium leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos de Recorrido */}
        <section className="bg-gradient-to-r from-[#2b1706] to-[#4a2e12] rounded-3xl shadow-2xl p-8 md:p-10 text-amber-100 border-2 border-amber-600">
          <div className="flex items-start gap-5">
            <div className="wood-texture-bg p-3.5 rounded-2xl border border-amber-500 shadow-md shrink-0">
              <Info className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h3 className="font-adventure text-3xl sm:text-4xl mb-6 text-amber-200">{t("mapPage.tipsTitle")}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-100 text-base font-medium leading-relaxed">
                <li className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip1")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-amber-500/20">
                  <PawPrint className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip2")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-amber-500/20">
                  <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip3")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-amber-500/20">
                  <Building className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip4")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-amber-500/20">
                  <Accessibility className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip5")}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
