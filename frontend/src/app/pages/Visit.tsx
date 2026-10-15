import { Clock, MapPin, Ticket, CreditCard, Users, Info, Car, Bus, AlertCircle, TreePine, Sparkles, Navigation } from "lucide-react";
import { useZoo } from "../context/ZooContext";

export function Visit() {
  const { currentLang } = useZoo();
  const isEs = currentLang === "es";

  const prices = [
    { type: isEs ? "Adultos" : "Adults", price: "$30 MXN", description: isEs ? "Mayores de 12 años" : "Older than 12 years" },
    { type: isEs ? "Niños" : "Children", price: "$15 MXN", description: isEs ? "De 3 a 12 años" : "Ages 3 to 12" },
    { type: isEs ? "Estudiantes" : "Students", price: "$20 MXN", description: isEs ? "Con credencial vigente" : "With valid student ID" },
    { type: isEs ? "Adultos Mayores" : "Seniors", price: "$15 MXN", description: isEs ? "Mayores de 60 años" : "Older than 60 years" },
    { type: isEs ? "Menores de 3 años" : "Children under 3", price: isEs ? "Gratis" : "Free", description: isEs ? "Entrada sin costo" : "Free admission" },
  ];

  const schedule = [
    { day: isEs ? "Martes a Domingo" : "Tuesday to Sunday", hours: "8:30 AM - 4:30 PM", note: isEs ? "Último acceso al parque: 3:30 PM" : "Last park access: 3:30 PM" },
    { day: isEs ? "Lunes" : "Monday", hours: isEs ? "Cerrado" : "Closed", note: isEs ? "Mantenimiento y descanso de fauna silvestre" : "Maintenance and wildlife rest day" },
  ];

  const recommendations = isEs ? [
    "Usa calzado cómodo y antiderrapante para los senderos empedrados",
    "Lleva protector solar biodegradable y repelente de mosquitos",
    "Lleva agua para hidratarte (por favor conserva tus botellas)",
    "Respeta las vallas de seguridad y no alimentes a los animales",
    "Mantén limpio el entorno utilizando los contenedores ecológicos",
    "No utilices flash al tomar fotografías para no estresar a los ejemplares"
  ] : [
    "Wear comfortable, non-slip shoes for cobblestone trails",
    "Bring biodegradable sunscreen and insect repellent",
    "Bring drinking water to stay hydrated (keep your trash with you)",
    "Respect safety railings and never feed any wildlife",
    "Keep the nature reserve clean using eco-friendly trash bins",
    "Never use flash photography to prevent animal stress"
  ];

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
              {isEs ? "Planifica tu Visita" : "Plan Your Visit"}
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              {isEs
                ? "Toda la información sobre horarios, cuotas de acceso, recomendaciones y rutas para disfrutar una experiencia inolvidable en la selva del ZooMAT."
                : "All information regarding operating hours, admission fees, tips, and directions for an unforgettable experience in the ZooMAT reserve."}
            </p>
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-5 sm:h-6 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-10" />
      </section>

      {/* 2. Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Horarios */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                {isEs ? "Horarios de Apertura" : "Opening Hours"}
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                {isEs
                  ? "Planifica tu tiempo para recorrer los 2.5 km de senderos con tranquilidad"
                  : "Plan your time to comfortably walk the 2.5 km jungle trail network"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedule.map((item, index) => (
              <div
                key={index}
                className="border-l-8 border-amber-600 bg-[#fcfaf5] p-6 rounded-r-3xl shadow-xs border border-amber-900/10"
              >
                <div className="font-adventure text-2xl text-[#2b1810]">{item.day}</div>
                <div className="text-3xl sm:text-4xl text-amber-900 font-black mt-2 font-adventure">{item.hours}</div>
                <div className="text-base text-stone-700 mt-2 font-bold">{item.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Precios */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                {isEs ? "Cuotas de Recuperación" : "Admission Prices"}
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                {isEs
                  ? "Cuotas oficiales destinadas a la manutención, atención médica y nutrición animal"
                  : "Official fees dedicated to animal nutrition, veterinary care, and habitat conservation"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((item, index) => (
              <div
                key={index}
                className="bg-[#fcfaf5] rounded-3xl p-7 border-2 border-amber-900/15 shadow-sm hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="font-adventure text-xl text-stone-900 mb-1">{item.type}</div>
                <div className="text-4xl sm:text-5xl font-black text-amber-900 mb-2 font-adventure">{item.price}</div>
                <div className="text-base text-stone-700 font-semibold">{item.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-amber-50 border-l-8 border-amber-500 p-6 rounded-2xl border border-amber-300 shadow-xs">
            <div className="flex items-start gap-4">
              <CreditCard className="w-7 h-7 text-amber-800 mt-0.5 shrink-0" />
              <div>
                <p className="font-adventure text-xl text-[#2b1810]">{isEs ? "Métodos de Pago" : "Payment Methods"}</p>
                <p className="text-base text-stone-800 font-medium">
                  {isEs
                    ? "Aceptamos efectivo en taquillas y cobro con tarjetas bancarias de débito y crédito."
                    : "We accept cash at the ticket counter as well as debit and credit cards."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación y Cómo Llegar */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                {isEs ? "Ubicación & Cómo Llegar" : "How to Get There"}
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                {isEs
                  ? "Ubicado dentro de la Reserva Natural El Zapotal, al sur de Tuxtla Gutiérrez"
                  : "Located inside the El Zapotal Nature Reserve, south of Tuxtla Gutiérrez"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10">
                <h3 className="font-adventure text-2xl text-[#2b1810] mb-2">{isEs ? "Dirección Oficial" : "Official Address"}</h3>
                <p className="text-stone-800 text-lg font-medium leading-relaxed">
                  Calzada Cerro Hueco S/N<br />
                  Col. El Zapotal, C.P. 29094<br />
                  Tuxtla Gutiérrez, Chiapas, México
                </p>
              </div>
              <div className="bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10">
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2 flex items-center gap-3">
                  <Car className="w-6 h-6 text-amber-700" />
                  {isEs ? "En Automóvil" : "By Car"}
                </h3>
                <p className="text-stone-800 text-base font-medium leading-relaxed">
                  {isEs
                    ? "A solo 15 minutos del centro de la ciudad transitando por Calzada Cerro Hueco. Estacionamiento amplio y vigilado disponible."
                    : "Only 15 minutes from downtown via Cerro Hueco Road. Free monitored parking area available."}
                </p>
              </div>
              <div className="bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10">
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2 flex items-center gap-3">
                  <Bus className="w-6 h-6 text-amber-700" />
                  {isEs ? "En Colectivo / Transporte Público" : "Public Transportation"}
                </h3>
                <p className="text-stone-800 text-base font-medium leading-relaxed">
                  {isEs
                    ? "Ruta de transporte colectivo local hacia Cerro Hueco / El Zapotal con parada directa en la entrada principal del ZooMAT."
                    : "Local public transport collective heading to Cerro Hueco / El Zapotal stops directly in front of the ZooMAT entrance."}
                </p>
              </div>
            </div>

            <div className="wood-texture-bg rounded-3xl p-8 text-amber-100 flex flex-col justify-between shadow-2xl border-4 border-amber-600">
              <div>
                <TreePine className="w-14 h-14 text-amber-400 mb-4" />
                <h3 className="font-adventure text-3xl sm:text-4xl text-amber-200 mb-3 text-adventure-shadow">
                  {isEs ? "Reserva Natural El Zapotal" : "El Zapotal Nature Reserve"}
                </h3>
                <p className="text-amber-100/90 text-lg sm:text-xl leading-relaxed mb-6 font-medium">
                  {isEs
                    ? "Más de 100 hectáreas de selva mediana subperennifolia protegida. Un verdadero pulmón verde donde conviven especies de fauna nativa en su hábitat original."
                    : "Over 100 hectares of protected native Chiapas semi-evergreen forest. A pristine ecosystem where native fauna thrives in its natural habitat."}
                </p>
              </div>
              <a
                href="https://www.google.com/maps/dir//Zool%C3%B3gico+Regional+Miguel+%C3%81lvarez+del+Toro,+Calz.+Cerro+Hueco+s%2Fn,+El+Zapotal,+29094+Tuxtla+Guti%C3%A9rrez,+Chis./"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-adventure text-lg px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-105"
              >
                <Navigation className="w-5 h-5 text-stone-950" />
                <span>{isEs ? "Abrir Ruta en Google Maps GPS" : "Open Google Maps Directions"}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd]">
          <div className="flex items-center gap-4 mb-6">
            <div className="wood-texture-bg p-3.5 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Info className="w-7 h-7" />
            </div>
            <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810]">
              {isEs ? "Recomendaciones para tu Recorrido" : "Visitor Recommendations"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3.5 bg-[#fcfaf5] p-5 rounded-2xl border border-amber-900/10 shadow-xs"
              >
                <div className="wood-texture-bg rounded-full p-1.5 mt-0.5 text-amber-200 flex-shrink-0">
                  <div className="w-2 h-2 bg-amber-300 rounded-full" />
                </div>
                <p className="text-stone-800 text-base sm:text-lg font-medium">{rec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grupos y Escuelas */}
        <section className="bg-gradient-to-r from-[#2b1706] to-[#4a2e12] text-amber-100 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-amber-600">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-8 h-8 text-amber-400" />
            <h2 className="font-adventure text-3xl sm:text-4xl text-amber-200">
              {isEs ? "Visitas Escolares y Recorridos Guiados" : "School & Group Tours"}
            </h2>
          </div>
          <p className="text-amber-100/90 text-lg sm:text-xl mb-6 leading-relaxed font-medium">
            {isEs
              ? "Ofrecemos talleres educativos interactivos y recorridos guiados por biólogos y educadores ambientales para escuelas y grupos organizados."
              : "We provide interactive educational workshops and guided tours led by biologists for schools and organized group visits."}
          </p>
          <div className="bg-black/30 rounded-2xl p-6 border border-amber-500/30">
            <p className="font-adventure text-xl text-amber-300 mb-2">
              {isEs ? "Contacto para Reservaciones de Grupos:" : "Group Reservation Inquiries:"}
            </p>
            <p className="text-amber-100 text-base font-semibold">Teléfono: (961) 614-4700 ext. 123</p>
            <p className="text-amber-100 text-base font-semibold">Correo: educacion@zoomat.chiapas.gob.mx</p>
          </div>
        </section>

        {/* Aviso de Reglamento */}
        <section className="bg-amber-100/80 border-l-8 border-amber-600 rounded-2xl p-6 shadow-sm border border-amber-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-7 h-7 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-adventure text-2xl text-amber-950 mb-2">
                {isEs ? "Reglamento del Parque y Bienestar Animal" : "Park Rules & Animal Welfare"}
              </h3>
              <ul className="text-stone-800 space-y-2 text-base font-medium">
                <li>• {isEs ? "Prohibido estrictamente alimentar a los animales." : "Strictly prohibited to feed animals."}</li>
                <li>• {isEs ? "Área 100% libre de humo y colillas de cigarro." : "100% smoke-free reserve."}</li>
                <li>• {isEs ? "No se permite el acceso con mascotas para salvaguardar la fauna nativa." : "No pets allowed to protect native wildlife."}</li>
                <li>• {isEs ? "Guarda silencio y respeta el descanso de las especies." : "Maintain quiet and respect the animals' natural rhythms."}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
