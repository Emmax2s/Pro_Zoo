import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Twitter, Heart } from "lucide-react";
import { useState } from "react";

function Tiktok({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Gracias por tu mensaje. Te contactaremos pronto.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      details: ["(961) 614-4700", "Lun-Vie 9:00-17:00"],
      links: ["tel:+529616144700", null]
    },
    {
      icon: Mail,
      title: "Email",
      details: ["zoomat@zoomat.chiapas.gob.mx", "Respuesta en 24-48 horas"],
      links: ["mailto:zoomat@zoomat.chiapas.gob.mx", null]
    },
    {
      icon: MapPin,
      title: "Dirección",
      details: ["Calzada Cerro Hueco S/N", "Tuxtla Gutiérrez, Chiapas"],
      links: [null, null]
    },
    {
      icon: Clock,
      title: "Horario de Atención",
      details: ["Mar-Dom: 9:00-17:00", "Cerrado los lunes"],
      links: [null, null]
    }
  ];

  const departments = [
    {
      name: "Educación Ambiental",
      email: "educacion@zoomat.chiapas.gob.mx",
      phone: "Ext. 123",
      description: "Visitas escolares y programas educativos"
    },
    {
      name: "Donaciones y Adopciones",
      email: "donaciones@zoomat.chiapas.gob.mx",
      phone: "Ext. 145",
      description: "Apoya la conservación de nuestros animales"
    },
    {
      name: "Administración",
      email: "admin@zoomat.chiapas.gob.mx",
      phone: "Ext. 100",
      description: "Información general y administrativa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Contacto</h1>
          <p className="text-xl text-green-100">
            Estamos aquí para ayudarte. Contáctanos para cualquier consulta
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-green-800 mb-6">Envíanos un Mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="informacion">Información General</option>
                    <option value="visita-escolar">Visita Escolar</option>
                    <option value="donacion">Donaciones</option>
                    <option value="voluntariado">Voluntariado</option>
                    <option value="quejas">Quejas y Sugerencias</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-700 text-white py-4 rounded-lg font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <info.icon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {info.links && info.links[idx] ? (
                          <a href={info.links[idx]} className="text-green-700 hover:underline">
                            {detail}
                          </a>
                        ) : (
                          detail
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Redes Sociales */}
            <div className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Síguenos en Redes Sociales</h3>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/ZoomatOficial/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/zoomatoficial_/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://twitter.com/SemahnChiapas" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://www.tiktok.com/@zoomat.oficial" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition">
                  <Tiktok className="w-6 h-6" />
                </a>
              </div>
              <p className="text-green-100 text-sm mt-4">
                Comparte tus fotos con #ZooMAT
              </p>
            </div>
          </div>
        </div>

        {/* Departamentos */}
        <section className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Departamentos Especializados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                <h3 className="font-bold text-lg text-green-800 mb-2">{dept.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-green-700">
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{dept.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Phone className="w-4 h-4" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Apoyo */}
        <section className="mt-12 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-xl shadow-lg p-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Apoya al ZooMAT</h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto mb-6">
            Tu apoyo es fundamental para continuar nuestra labor de conservación y educación.
            Puedes contribuir mediante donaciones, adopciones simbólicas de animales o siendo voluntario.
          </p>
          <button className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
            Conoce Cómo Ayudar
          </button>
        </section>
      </div>
    </div>
  );
}
