import { Clock, MapPin, Ticket, CreditCard, Users, Info, Car, Bus, AlertCircle, TreePine, Navigation } from "lucide-react";

export function Visit() {
  const prices = [
    { type: "Adultos", price: "$30 MXN", description: "Mayores de 12 años" },
    { type: "Niños", price: "$15 MXN", description: "De 3 a 12 años" },
    { type: "Estudiantes", price: "$20 MXN", description: "Con credencial vigente" },
    { type: "Adultos Mayores", price: "$15 MXN", description: "Mayores de 60 años" },
    { type: "Menores de 3 años", price: "Gratis", description: "Entrada sin costo" },
  ];

  const schedule = [
    { day: "Martes a Domingo", hours: "8:30 AM - 4:30 PM", note: "Último acceso al parque: 3:30 PM" },
    { day: "Lunes", hours: "Cerrado", note: "Mantenimiento y descanso de fauna silvestre" },
  ];

  const recommendations = [
    "Usa calzado cómodo y antiderrapante para los senderos empedrados",
    "Lleva protector solar biodegradable y repelente de mosquitos",
    "Lleva agua para hidratarte (por favor conserva tus botellas)",
    "Respeta las vallas de seguridad y no alimentes a los animales",
    "Mantén limpio el entorno utilizando los contenedores ecológicos",
    "No utilices flash al tomar fotografías para no estresar a los ejemplares"
  ];

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
              <span>ZOOLÓGICO REGIONAL MIGUEL ÁLVAREZ DEL TORO</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.1] text-adventure-shadow">
              Planifica tu Visita
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              Toda la información sobre horarios, cuotas de acceso, recomendaciones y rutas para disfrutar una experiencia inolvidable en la selva del ZooMAT.
            </p>
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-5 sm:h-6 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-10" />
      </section>

      {/* 2. Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Horarios */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                Horarios de Apertura
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                Planifica tu tiempo para recorrer los 2.5 km de senderos con tranquilidad
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedule.map((item, index) => (
              <div
                key={index}
                className="interactive-card border-l-8 border-amber-600 bg-[#fcfaf5] p-6 rounded-r-3xl shadow-xs border border-amber-900/10 hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500 transition-all duration-300 ease-out will-change-transform"
              >
                <div className="font-adventure text-2xl text-[#2b1810]">{item.day}</div>
                <div className="text-3xl sm:text-4xl text-amber-900 font-black mt-2 font-adventure">{item.hours}</div>
                <div className="text-base text-stone-700 mt-2 font-bold">{item.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Precios */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                Cuotas de Recuperación
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                Cuotas oficiales destinadas a la manutención, atención médica y nutrición animal
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((item, index) => (
              <div
                key={index}
                className="interactive-card bg-[#fcfaf5] rounded-3xl p-7 border-2 border-amber-900/15 shadow-sm hover:shadow-xl hover:border-amber-500 hover:-translate-y-2 transition-all duration-300 ease-out will-change-transform"
              >
                <div className="font-adventure text-xl text-stone-900 mb-1">{item.type}</div>
                <div className="text-4xl sm:text-5xl font-black text-amber-900 mb-2 font-adventure">{item.price}</div>
                <div className="text-base text-stone-700 font-semibold">{item.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-amber-50 border-l-8 border-amber-500 p-6 rounded-2xl border border-amber-300 shadow-xs hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-4">
              <CreditCard className="w-7 h-7 text-amber-800 mt-0.5 shrink-0" />
              <div>
                <p className="font-adventure text-xl text-[#2b1810]">Métodos de Pago</p>
                <p className="text-base text-stone-800 font-medium">
                  Aceptamos efectivo en taquillas y cobro con tarjetas bancarias de débito y crédito.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación y Cómo Llegar */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="wood-texture-bg p-4 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] tracking-wide">
                Ubicación &amp; Cómo Llegar
              </h2>
              <p className="text-lg text-stone-600 font-medium">
                Ubicado dentro de la Reserva Natural El Zapotal, al sur de Tuxtla Gutiérrez
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="interactive-card bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 transition-all duration-200 will-change-transform">
                <h3 className="font-adventure text-2xl text-[#2b1810] mb-2">Dirección Oficial</h3>
                <p className="text-stone-800 text-lg font-medium leading-relaxed">
                  Calzada Cerro Hueco S/N<br />
                  Col. El Zapotal, C.P. 29094<br />
                  Tuxtla Gutiérrez, Chiapas, México
                </p>
              </div>
              <div className="interactive-card bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 transition-all duration-200 will-change-transform">
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2 flex items-center gap-3">
                  <Car className="w-6 h-6 text-amber-700" />
                  En Automóvil
                </h3>
                <p className="text-stone-800 text-base font-medium leading-relaxed">
                  A solo 15 minutos del centro de la ciudad transitando por Calzada Cerro Hueco. Estacionamiento amplio y vigilado disponible.
                </p>
              </div>
              <div className="interactive-card bg-[#fcfaf5] p-6 rounded-2xl border-2 border-amber-900/10 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 transition-all duration-200 will-change-transform">
                <h3 className="font-adventure text-xl text-[#2b1810] mb-2 flex items-center gap-3">
                  <Bus className="w-6 h-6 text-amber-700" />
                  En Colectivo / Transporte Público
                </h3>
                <p className="text-stone-800 text-base font-medium leading-relaxed">
                  Ruta de transporte colectivo local hacia Cerro Hueco / El Zapotal con parada directa en la entrada principal del ZooMAT.
                </p>
              </div>
            </div>

            <div className="wood-texture-bg rounded-3xl p-8 text-amber-100 flex flex-col justify-between shadow-2xl border-4 border-amber-600 hover:border-amber-500 transition-colors duration-300">
              <div>
                <TreePine className="w-14 h-14 text-amber-400 mb-4" />
                <h3 className="font-adventure text-3xl sm:text-4xl text-amber-200 mb-3 text-adventure-shadow">
                  Reserva Natural El Zapotal
                </h3>
                <p className="text-amber-100/90 text-lg sm:text-xl leading-relaxed mb-6 font-medium">
                  Más de 100 hectáreas de selva mediana subperennifolia protegida. Un verdadero pulmón verde donde conviven especies de fauna nativa en su hábitat original.
                </p>
              </div>
              <a
                href="https://www.google.com/maps/dir//Zool%C3%B3gico+Regional+Miguel+%C3%81lvarez+del+Toro,+Calz.+Cerro+Hueco+s%2Fn,+El+Zapotal,+29094+Tuxtla+Guti%C3%A9rrez,+Chis./"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-adventure text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 active:scale-95 will-change-transform"
              >
                <Navigation className="w-5 h-5 text-stone-950" />
                <span>Abrir Ruta en Google Maps GPS</span>
              </a>
            </div>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="reveal-on-scroll bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="wood-texture-bg p-3.5 rounded-2xl text-amber-200 border-2 border-amber-600 shadow-md">
              <Info className="w-7 h-7" />
            </div>
            <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810]">
              Recomendaciones para tu Recorrido
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="interactive-card flex items-start gap-3.5 bg-[#fcfaf5] p-5 rounded-2xl border border-amber-900/10 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-amber-400/50 hover:bg-[#fffdf7] transition-all duration-200 will-change-transform"
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
        <section className="reveal-on-scroll bg-gradient-to-r from-[#2b1706] to-[#4a2e12] text-amber-100 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-amber-600 hover:border-amber-500 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-8 h-8 text-amber-400" />
            <h2 className="font-adventure text-3xl sm:text-4xl text-amber-200">
              Visitas Escolares y Recorridos Guiados
            </h2>
          </div>
          <p className="text-amber-100/90 text-lg sm:text-xl mb-6 leading-relaxed font-medium">
            Ofrecemos talleres educativos interactivos y recorridos guiados por biólogos y educadores ambientales para escuelas y grupos organizados.
          </p>
          <div className="bg-black/30 rounded-2xl p-6 border border-amber-500/30">
            <p className="font-adventure text-xl text-amber-300 mb-2">
              Contacto para Reservaciones de Grupos:
            </p>
            <p className="text-amber-100 text-base font-semibold">Teléfono: (961) 614-4700 ext. 123</p>
            <p className="text-amber-100 text-base font-semibold">Correo: educacion@zoomat.chiapas.gob.mx</p>
          </div>
        </section>

        {/* Aviso de Reglamento */}
        <section className="reveal-on-scroll bg-amber-100/80 border-l-8 border-amber-600 rounded-2xl p-6 shadow-sm border border-amber-300 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-7 h-7 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-adventure text-2xl text-amber-950 mb-2">
                Reglamento del Parque y Bienestar Animal
              </h3>
              <ul className="text-stone-800 space-y-2 text-base font-medium">
                <li>• Prohibido estrictamente alimentar a los animales.</li>
                <li>• Área 100% libre de humo y colillas de cigarro.</li>
                <li>• No se permite el acceso con mascotas para salvaguardar la fauna nativa.</li>
                <li>• Guarda silencio y respeta el descanso de las especies.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
