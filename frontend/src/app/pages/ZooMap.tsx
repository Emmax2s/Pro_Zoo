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

export function ZooMap() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");

  const zones = [
    {
      id: "felinos",
      name: "Zona de Felinos",
      icon: PawPrint,
      color: "bg-amber-50/90 border-amber-400 text-amber-950",
      badgeColor: "bg-amber-600 text-white",
      animals: ["Jaguar", "Ocelote", "Tigrillo", "Puma"],
      location: "Entrada Norte",
      desc: "Especies de felinos autóctonos protegidos en recintos naturales adaptados a su entorno selvático.",
    },
    {
      id: "aviario",
      name: "Aviario Tropical",
      icon: Feather,
      color: "bg-sky-50/90 border-sky-400 text-sky-950",
      badgeColor: "bg-sky-600 text-white",
      animals: ["Guacamaya Roja", "Tucán Pico Iris", "Águila Arpía", "Quetzal"],
      location: "Zona Central",
      desc: "Gran estructura inmersiva para observar aves en vuelo libre y vegetación tropical densa.",
    },
    {
      id: "primates",
      name: "Isla de Primates",
      icon: Trees,
      color: "bg-purple-50/90 border-purple-400 text-purple-950",
      badgeColor: "bg-purple-600 text-white",
      animals: ["Mono Araña", "Mono Aullador (Saraguato)", "Mono Capuchino"],
      location: "Zona Este",
      desc: "Hábitats arbolados rodeados de agua para la conservación y bienestar de primates nativos.",
    },
    {
      id: "reptiles",
      name: "Herpetario & Cocodrilario",
      icon: ShieldAlert,
      color: "bg-emerald-50/90 border-emerald-400 text-emerald-950",
      badgeColor: "bg-emerald-700 text-white",
      animals: ["Cocodrilo de Pantano", "Boa Constrictor", "Iguana Verde", "Tortuga Casquito"],
      location: "Zona Sur",
      desc: "Espacio especializado en anfibios, reptiles y conservación de caimanes de ríos chiapanecos.",
    },
    {
      id: "herbivoros",
      name: "Reserva de Herbívoros",
      icon: Compass,
      color: "bg-orange-50/90 border-orange-400 text-orange-950",
      badgeColor: "bg-orange-600 text-white",
      animals: ["Tapir Centroamericano", "Venado Cola Blanca", "Pecarí de Collar"],
      location: "Zona Oeste",
      desc: "Senderos amplios para observar grandes mamíferos herbívoros en semilibertad.",
    },
  ];

  const facilities = [
    {
      name: "Taquillas y Accesos",
      icon: Building,
      description: "Entrada principal y módulos de información turística",
    },
    {
      name: "Área de Alimentos",
      icon: Utensils,
      description: "Cafetería con bebidas frescas y comida regional",
    },
    {
      name: "Servicios Sanitarios",
      icon: Accessibility,
      description: "Módulos de sanitarios limpios distribuidos en el sendero",
    },
    {
      name: "Primeros Auxilios",
      icon: Heart,
      description: "Puesto de atención médica inmediata para visitantes",
    },
  ];

  const highlights = [
    {
      title: "Sendero Interpretativo El Zapotal",
      description: "Recorrido empedrado de 2.5 km en plena selva baja que conecta todas las exhibiciones de fauna nativa.",
      icon: TreePine,
      duration: "90-120 minutos",
    },
    {
      title: "Mirador Panorámico de Canopia",
      description: "Vista espectacular de la vegetación nativa y el relieve de Tuxtla Gutiérrez.",
      icon: Camera,
      duration: "15-20 minutos",
    },
  ];
  const googleMapsDirectionsUrl =
    "https://www.google.com/maps/dir//Zool%C3%B3gico+Regional+Miguel+%C3%81lvarez+del+Toro,+Calz.+Cerro+Hueco+s%2Fn,+El+Zapotal,+29094+Tuxtla+Guti%C3%A9rrez,+Chis./";

  const filteredZones = activeTab === "all" ? zones : zones.filter((z) => z.id === activeTab);

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 pb-20">
      {/* 1. Header Banner matching photo 1 style */}
      <section className="reveal-on-scroll relative bg-[#f7f3e8] border-b-4 border-[#2b1706] py-14 md:py-20 overflow-hidden">
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
        <div className="reveal-on-scroll wood-texture-bg rounded-3xl p-8 text-amber-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border-4 border-amber-600 hover:border-amber-500 transition-colors duration-300">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-amber-400 text-stone-950 shadow-lg">
              <Navigation className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-adventure text-2xl sm:text-3xl text-amber-200">
                ¿Vienes en camino al ZooMAT?
              </h3>
              <p className="text-amber-100/90 text-base sm:text-lg font-medium">
                Abre la ruta en tiempo real directamente en tu aplicación de navegación GPS.
              </p>
            </div>
          </div>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-adventure text-lg tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 active:scale-95 transition-all duration-200 text-center flex-shrink-0 will-change-transform"
          >
            {t("mapPage.openGoogleMaps")}
          </a>
        </div>

        {/* Zonas Temáticas */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide mb-2">
                {t("mapPage.zonesTitle")}
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-medium">
                Filtra y explora las distintas zonas de conservación dentro del sendero de 2.5 km.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 cursor-pointer will-change-transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 ${
                  activeTab === "all"
                    ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                    : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 hover:shadow-sm border border-amber-900/20"
                }`}
              >
                Todas las zonas
              </button>
              {zones.map((z) => {
                const IconComp = z.icon;
                return (
                  <button
                    key={z.id}
                    onClick={() => setActiveTab(z.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer will-change-transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 ${
                      activeTab === z.id
                        ? "wood-texture-bg text-amber-200 border-2 border-amber-600 shadow-md wood-button-shadow scale-105"
                        : "bg-[#fcfaf5] text-stone-800 hover:bg-amber-100/60 hover:shadow-sm border border-amber-900/20"
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
                  className={`interactive-card ${zone.color} border-2 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-md flex flex-col justify-between will-change-transform`}
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
                      Especies protegidas:
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

        {/* Puntos de Interés */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] mb-6">
            Senderos y Miradores Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="interactive-card wood-texture-bg text-amber-100 rounded-3xl p-7 shadow-lg border-2 border-amber-600 hover:border-amber-400 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between will-change-transform group"
              >
                <div>
                  <highlight.icon className="w-10 h-10 mb-4 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="font-adventure text-2xl sm:text-3xl text-amber-200 mb-2">{highlight.title}</h3>
                  <p className="text-amber-100/90 text-base sm:text-lg mb-5 leading-relaxed font-medium">
                    {highlight.description}
                  </p>
                </div>
                <div className="bg-black/40 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-300 border border-amber-500/30 w-fit">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Duración aprox: {highlight.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] mb-6">          {t("mapPage.servicesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="interactive-card bg-[#fcfaf5] rounded-2xl p-6 text-center border-2 border-amber-900/10 shadow-xs hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-400/50 hover:bg-[#fffdf7] transition-all duration-200 will-change-transform group"
              >
                <div className="wood-texture-bg w-16 h-16 rounded-2xl text-amber-200 border border-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-2 transition-transform duration-200">
                  <facility.icon className="w-8 h-8" />
                </div>
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2">{facility.name}</h3>
                <p className="text-stone-700 text-sm font-medium leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos de Recorrido */}
        <section className="reveal-on-scroll bg-gradient-to-r from-[#2b1706] to-[#4a2e12] rounded-3xl shadow-2xl p-8 md:p-10 text-amber-100 border-2 border-amber-600 hover:border-amber-500 transition-colors duration-300">
          <div className="flex items-start gap-5">
            <div className="wood-texture-bg p-3.5 rounded-2xl border border-amber-500 shadow-md shrink-0">
              <Info className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h3 className="font-adventure text-3xl sm:text-4xl mb-6 text-amber-200">              {t("mapPage.tipsTitle")}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-100 text-base font-medium leading-relaxed">
                <li className="flex items-center gap-3 bg-black/30 hover:bg-black/45 hover:-translate-y-0.5 p-4 rounded-xl border border-amber-500/20 transition-all duration-200 will-change-transform">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip1")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 hover:bg-black/45 hover:-translate-y-0.5 p-4 rounded-xl border border-amber-500/20 transition-all duration-200 will-change-transform">
                  <PawPrint className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip2")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 hover:bg-black/45 hover:-translate-y-0.5 p-4 rounded-xl border border-amber-500/20 transition-all duration-200 will-change-transform">
                  <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip3")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 hover:bg-black/45 hover:-translate-y-0.5 p-4 rounded-xl border border-amber-500/20 transition-all duration-200 will-change-transform">
                  <Building className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip4")}</span>
                </li>
                <li className="flex items-center gap-3 bg-black/30 hover:bg-black/45 hover:-translate-y-0.5 p-4 rounded-xl border border-amber-500/20 transition-all duration-200 will-change-transform">
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
