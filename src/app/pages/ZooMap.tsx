import { MapPin, Info, Utensils, ShoppingBag, Heart, TreePine, Camera, Compass, ExternalLink, Navigation, PawPrint, Feather, Trees, ShieldAlert, Droplets, Clock, Sun, Building, Accessibility } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ZooMap() {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === 'es';
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
      desc: isEs ? "Especies de felinos autóctonos protegidos en recintos naturales." : "Native feline species protected in natural enclosures."
    },
    {
      id: "aviario",
      name: isEs ? "Aviario Tropical" : "Tropical Aviary",
      icon: Feather,
      color: "bg-sky-50/90 border-sky-400 text-sky-950",
      badgeColor: "bg-sky-600 text-white",
      animals: ["Guacamaya Roja", "Tucán Pico Iris", "Águila Arpía", "Quetzal"],
      location: isEs ? "Zona Central" : "Central Zone",
      desc: isEs ? "Gran estructura inmersiva para observar aves en vuelo libre." : "Large immersive structure to observe free-flying birds."
    },
    {
      id: "primates",
      name: isEs ? "Isla de Primates" : "Primate Island",
      icon: Trees,
      color: "bg-purple-50/90 border-purple-400 text-purple-950",
      badgeColor: "bg-purple-600 text-white",
      animals: ["Mono Araña", "Mono Aullador (Saraguato)", "Mono Capuchino"],
      location: isEs ? "Zona Este" : "East Zone",
      desc: isEs ? "Hábitats arbolados rodeados de agua para la conservación de primates." : "Wooded habitats surrounded by water for primate conservation."
    },
    {
      id: "reptiles",
      name: isEs ? "Herpetario y Cocodrilario" : "Reptile & Crocodile Center",
      icon: ShieldAlert,
      color: "bg-emerald-50/90 border-emerald-400 text-emerald-950",
      badgeColor: "bg-emerald-700 text-white",
      animals: ["Cocodrilo de Pantano", "Boa Constrictor", "Iguana Verde", "Tortuga Casquito"],
      location: isEs ? "Zona Sur" : "South Zone",
      desc: isEs ? "Espacio especializado en anfibios, reptiles y conservación de caimanes." : "Specialized facility for amphibians, reptiles, and alligator conservation."
    },
    {
      id: "herbivoros",
      name: isEs ? "Reserva de Herbívoros" : "Herbivore Reserve",
      icon: Compass,
      color: "bg-orange-50/90 border-orange-400 text-orange-950",
      badgeColor: "bg-orange-600 text-white",
      animals: ["Tapir Centroamericano", "Venado Cola Blanca", "Pecarí de Collar"],
      location: isEs ? "Zona Oeste" : "West Zone",
      desc: isEs ? "Senderos amplios para observar grandes mamíferos herbívoros." : "Wide trails to observe large herbivorous mammals."
    },
    {
      id: "acuatica",
      name: isEs ? "Zona Acuática y Nutrias" : "Aquatic Zone & Otters",
      icon: Droplets,
      color: "bg-cyan-50/90 border-cyan-400 text-cyan-950",
      badgeColor: "bg-cyan-600 text-white",
      animals: ["Nutria de Río", "Garza Blanca", "Patos Silvestres"],
      location: isEs ? "Lago Central" : "Central Lake",
      desc: isEs ? "Ecosistema de arroyos y estanques con miradores sumergidos." : "Stream and pond ecosystem with submerged viewing windows."
    }
  ];

  const filteredZones = activeTab === "all" ? zones : zones.filter(z => z.id === activeTab);

  const facilities = [
    { icon: Utensils, name: isEs ? "Cafetería y Snacks" : "Cafeteria & Snacks", description: isEs ? "Alimentos, bebidas frías y descanso" : "Food, cold drinks and rest area" },
    { icon: ShoppingBag, name: isEs ? "Tienda de Recuerdos" : "Gift Shop", description: isEs ? "Souvenirs artesanales y guías" : "Handicraft souvenirs and field guides" },
    { icon: Heart, name: isEs ? "Primeros Auxilios" : "First Aid Station", description: isEs ? "Personal médico y atención básica" : "Medical staff and basic aid" },
    { icon: Info, name: isEs ? "Centro de Visitantes" : "Visitor Information", description: isEs ? "Mapas impresos e información de rutas" : "Printed maps and route information" },
  ];

  const highlights = [
    {
      title: isEs ? "Sendero Interpretativo El Zapotal" : "El Zapotal Interpretive Trail",
      description: isEs ? "Recorrido empedrado de 2.5 km en plena selva baja que conecta todas las exhibiciones." : "A 2.5 km cobblestone path through low jungle connecting all exhibits.",
      icon: TreePine,
      duration: isEs ? "45-60 minutos" : "45-60 minutes"
    },
    {
      title: isEs ? "Mirador Panorámico de Canopia" : "Canopy Panoramic Lookout",
      description: isEs ? "Vista espectacular de la vegetación nativa y el relieve de Tuxtla Gutiérrez." : "Spectacular view of native vegetation and Tuxtla Gutiérrez landscape.",
      icon: Camera,
      duration: isEs ? "15 minutos" : "15 minutes"
    }
  ];

  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.612711003444!2d-93.0975618!3d16.7460298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ed272bc9776d63%3A0xc3f6a2c2622fbb95!2sZool%C3%B3gico%20Regional%20Miguel%20%C3%81lvarez%20del%20Toro!5e0!3m2!1ses!2smx!45";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir//Zool%C3%B3gico+Regional+Miguel+%C3%81lvarez+del+Toro,+Calz.+Cerro+Hueco+s%2Fn,+El+Zapotal,+29094+Tuxtla+Guti%C3%A9rrez,+Chis./";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-stone-50 to-emerald-100/50">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white py-16 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
            <Compass className="w-5 h-5 text-amber-400" />
            <span>{isEs ? "Navegación del Parque" : "Park Navigation"}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">{t("mapPage.title")}</h1>
          <p className="text-lg sm:text-2xl text-emerald-100 font-semibold max-w-3xl">
            {t("mapPage.subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Mapa Interactivo con Google Maps Real */}
        <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-100">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-4 border-amber-400">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-800 p-3.5 rounded-2xl border border-emerald-700">
                <MapPin className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">{t("mapPage.generalPlan")}</h2>
                <p className="text-sm sm:text-base text-emerald-200 font-medium mt-1">
                  Calzada Cerro Hueco S/N, Col. El Zapotal, Tuxtla Gutiérrez, Chiapas.
                </p>
              </div>
            </div>
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3.5 rounded-2xl transition shadow-lg text-base shrink-0 hover:scale-105"
            >
              <Navigation className="w-5 h-5" />
              <span>{t("mapPage.directions")}</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* Iframe Interactivo en Vivo */}
          <div className="relative w-full h-[450px] sm:h-[550px] bg-stone-100">
            <iframe
              title="Google Maps ZooMAT"
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* Zonas Temáticas Interactivos */}
        <section className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-emerald-950 mb-2">{t("mapPage.zonesTitle")}</h2>
              <p className="text-stone-600 text-sm">
                {isEs ? "Filtra y explora las distintas zonas de conservación dentro del recorrido." : "Filter and explore the conservation zones along the trail."}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "all" ? "bg-emerald-800 text-white shadow-sm" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {isEs ? "Todas las zonas" : "All zones"}
              </button>
              {zones.map(z => {
                const IconComp = z.icon;
                return (
                  <button
                    key={z.id}
                    onClick={() => setActiveTab(z.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                      activeTab === z.id ? "bg-emerald-800 text-white shadow-md" : "bg-stone-100 text-stone-800 hover:bg-stone-200"
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
                <div key={index} className={`${zone.color} border-2 rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1 shadow-md flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-end mb-4">
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${zone.badgeColor}`}>
                        {zone.location}
                      </span>
                    </div>
                    <h3 className="font-black text-2xl mb-2 text-emerald-950">{zone.name}</h3>
                    <p className="text-sm font-medium opacity-90 mb-5 leading-relaxed">{zone.desc}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-black/10">
                    <p className="font-black text-xs uppercase tracking-wider opacity-80 text-emerald-950">
                      {isEs ? "Especies destacadas:" : "Featured species:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.animals.map((animal, idx) => (
                        <span key={idx} className="bg-white/90 text-xs font-extrabold px-3 py-1 rounded-lg border border-black/5 shadow-2xs text-emerald-950">
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

        {/* Servicios */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-emerald-100">
          <h2 className="text-3xl font-black text-emerald-950 mb-6">{t("mapPage.servicesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 to-stone-50 rounded-2xl p-6 text-center border-2 border-emerald-200/80 shadow-xs">
                <facility.icon className="w-10 h-10 text-emerald-800 mx-auto mb-3" />
                <h3 className="font-extrabold text-lg text-emerald-950 mb-1">{facility.name}</h3>
                <p className="text-sm text-stone-700 font-medium leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Puntos de Interés */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-emerald-100">
          <h2 className="text-3xl font-black text-emerald-950 mb-6">
            {isEs ? "Senderos y Miradores Destacados" : "Featured Trails & Lookouts"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-7 shadow-lg border-2 border-emerald-700">
                <highlight.icon className="w-10 h-10 mb-4 text-amber-400" />
                <h3 className="font-black text-2xl mb-2">{highlight.title}</h3>
                <p className="text-emerald-100 text-base mb-5 leading-relaxed font-medium">{highlight.description}</p>
                <div className="bg-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/10">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{isEs ? "Duración aprox:" : "Approx duration:"} {highlight.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos de Recorrido (Photo 2 - Emojis removed, clean Lucide icons added) */}
        <section className="bg-gradient-to-r from-emerald-900 to-emerald-950 rounded-3xl shadow-2xl p-8 md:p-10 text-white border-b-4 border-amber-400">
          <div className="flex items-start gap-5">
            <div className="bg-emerald-800 p-3.5 rounded-2xl border border-emerald-700">
              <Info className="w-8 h-8 text-amber-400 shrink-0" />
            </div>
            <div>
              <h3 className="font-black text-3xl mb-6 text-white">{t("mapPage.tipsTitle")}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-emerald-100 text-base font-medium leading-relaxed">
                <li className="flex items-center gap-3 bg-emerald-800/40 p-3.5 rounded-xl border border-emerald-700/50">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip1")}</span>
                </li>
                <li className="flex items-center gap-3 bg-emerald-800/40 p-3.5 rounded-xl border border-emerald-700/50">
                  <PawPrint className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip2")}</span>
                </li>
                <li className="flex items-center gap-3 bg-emerald-800/40 p-3.5 rounded-xl border border-emerald-700/50">
                  <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip3")}</span>
                </li>
                <li className="flex items-center gap-3 bg-emerald-800/40 p-3.5 rounded-xl border border-emerald-700/50">
                  <Building className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{t("mapPage.tip4")}</span>
                </li>
                <li className="flex items-center gap-3 bg-emerald-800/40 p-3.5 rounded-xl border border-emerald-700/50">
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
