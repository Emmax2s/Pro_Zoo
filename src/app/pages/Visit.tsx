import { Clock, MapPin, Ticket, CreditCard, Users, Info, Car, Bus, AlertCircle } from "lucide-react";

export function Visit() {
  const prices = [
    { type: "Adultos", price: "$30", description: "Mayores de 12 años" },
    { type: "Niños", price: "$15", description: "De 3 a 12 años" },
    { type: "Estudiantes", price: "$20", description: "Con credencial vigente" },
    { type: "Adultos Mayores", price: "$15", description: "Mayores de 60 años" },
    { type: "Menores de 3 años", price: "Gratis", description: "Entrada sin costo" },
  ];

  const schedule = [
    { day: "Martes a Domingo", hours: "9:00 - 17:00", note: "Último acceso: 16:00" },
    { day: "Lunes", hours: "Cerrado", note: "Excepto días festivos" },
  ];

  const recommendations = [
    "Usa ropa y calzado cómodo para caminar",
    "Lleva protector solar y repelente de insectos",
    "Trae agua y snacks (no se permite alimentar a los animales)",
    "Respeta las señalizaciones y no cruces las barreras",
    "Mantén limpio el zoológico usando los botes de basura",
    "No uses flash al tomar fotografías"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Planea tu Visita</h1>
          <p className="text-xl text-green-100">
            Toda la información que necesitas para disfrutar tu día en el ZooMAT
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Horarios */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-green-700" />
            <h2 className="text-3xl font-bold text-green-800">Horarios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item, index) => (
              <div key={index} className="border-l-4 border-green-600 pl-4 py-2">
                <div className="font-bold text-xl text-gray-800">{item.day}</div>
                <div className="text-2xl text-green-700 font-semibold">{item.hours}</div>
                <div className="text-sm text-gray-600 mt-1">{item.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Precios */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="w-8 h-8 text-green-700" />
            <h2 className="text-3xl font-bold text-green-800">Precios de Entrada</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                <div className="font-bold text-lg text-gray-800 mb-1">{item.type}</div>
                <div className="text-3xl font-bold text-green-700 mb-2">{item.price}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Métodos de Pago</p>
                <p className="text-sm text-blue-800">Aceptamos efectivo y tarjetas de crédito/débito</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-green-700" />
            <h2 className="text-3xl font-bold text-green-800">Ubicación</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Dirección</h3>
                  <p className="text-gray-700">
                    Calzada Cerro Hueco S/N<br />
                    Col. El Zapotal<br />
                    Tuxtla Gutiérrez, Chiapas<br />
                    C.P. 29094
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Cómo Llegar en Auto
                  </h3>
                  <p className="text-gray-700">
                    Ubicado a 8 km del centro de Tuxtla Gutiérrez por la Calzada Cerro Hueco.
                    Estacionamiento gratuito disponible.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <Bus className="w-5 h-5" />
                    Transporte Público
                  </h3>
                  <p className="text-gray-700">
                    Toma las rutas de camión que van hacia "Cerro Hueco" o "El Zapotal".
                    Pregunta al conductor por la parada del ZooMAT.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Mapa Interactivo</p>
                <p className="text-sm">Calzada Cerro Hueco, Tuxtla Gutiérrez</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-8 h-8 text-green-700" />
            <h2 className="text-3xl font-bold text-green-800">Recomendaciones para tu Visita</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grupos */}
        <section className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Visitas Grupales y Escolares</h2>
          </div>
          <p className="text-green-100 text-lg mb-4">
            Ofrecemos tours guiados y programas educativos para grupos escolares y organizaciones.
          </p>
          <ul className="space-y-2 mb-6 text-green-100">
            <li>• Tours educativos con guías especializados</li>
            <li>• Descuentos especiales para grupos de más de 20 personas</li>
            <li>• Talleres y actividades interactivas</li>
            <li>• Reservaciones con anticipación requeridas</li>
          </ul>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-semibold mb-1">Para reservar tu visita grupal:</p>
            <p className="text-green-100">Contacta al departamento de educación</p>
            <p className="text-green-100">Tel: (961) 614-4700 ext. 123</p>
            <p className="text-green-100">educacion@zoomat.chiapas.gob.mx</p>
          </div>
        </section>

        {/* Aviso */}
        <section className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Importante</h3>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• No está permitido introducir alimentos para los animales</li>
                <li>• Prohibido fumar dentro de las instalaciones</li>
                <li>• No se permite el ingreso de mascotas</li>
                <li>• Los horarios pueden cambiar en días festivos</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
