import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Heart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isEs ? "Gracias por tu mensaje. Te contactaremos pronto." : "Thank you for your message. We will contact you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact.phoneTitle"),
      details: ["(961) 614-4700", t("contact.phoneHours")],
      links: ["tel:+529616144700", null]
    },
    {
      icon: Mail,
      title: t("contact.emailTitle"),
      details: ["zoomat@zoomat.chiapas.gob.mx", t("contact.emailResponse")],
      links: ["mailto:zoomat@zoomat.chiapas.gob.mx", null]
    },
    {
      icon: MapPin,
      title: t("contact.addressTitle"),
      details: [t("contact.addressText"), "Tuxtla Gutiérrez, Chiapas"],
      links: [null, null]
    },
    {
      icon: Clock,
      title: t("contact.hoursTitle"),
      details: [t("contact.hoursDetail"), ""],
      links: [null, null]
    }
  ];

  const departments = [
    {
      name: t("contact.deptEduName"),
      email: "educacion@zoomat.chiapas.gob.mx",
      phone: "Ext. 123",
      description: t("contact.deptEduDesc")
    },
    {
      name: t("contact.deptDonName"),
      email: "donaciones@zoomat.chiapas.gob.mx",
      phone: "Ext. 145",
      description: t("contact.deptDonDesc")
    },
    {
      name: t("contact.deptAdminName"),
      email: "admin@zoomat.chiapas.gob.mx",
      phone: "Ext. 100",
      description: t("contact.deptAdminDesc")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white py-16 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">{t("contact.title")}</h1>
          <p className="text-lg sm:text-2xl text-emerald-100 font-semibold max-w-2xl">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-emerald-100">
              <h2 className="text-3xl md:text-4xl font-black text-emerald-950 mb-8">{t("contact.sendMessage")}</h2>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-extrabold text-emerald-950 mb-2">
                      {t("contact.fullName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 border-2 border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-600 text-base font-semibold bg-emerald-50/30"
                      placeholder={isEs ? "Tu nombre completo" : "Your full name"}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-extrabold text-emerald-950 mb-2">
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-4 border-2 border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-600 text-base font-semibold bg-emerald-50/30"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-extrabold text-emerald-950 mb-2">
                    {t("contact.subject")}
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-600 text-base font-semibold bg-emerald-50/30"
                  >
                    <option value="">{t("contact.selectSubject")}</option>
                    <option value="informacion">{t("contact.optGeneral")}</option>
                    <option value="visita-escolar">{t("contact.optSchool")}</option>
                    <option value="donacion">{t("contact.optDonation")}</option>
                    <option value="voluntariado">{t("contact.optVolunteer")}</option>
                    <option value="quejas">{t("contact.optFeedback")}</option>
                    <option value="otro">{t("contact.optOther")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    {t("contact.message")}
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                    placeholder={t("contact.messagePlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold hover:bg-emerald-900 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  {t("contact.sendButton")}
                </button>
              </form>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl text-emerald-800">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-950 mb-1">{info.title}</h3>
                    {info.details.filter(Boolean).map((detail, idx) => (
                      <p key={idx} className="text-stone-600 text-sm">
                        {info.links && info.links[idx] ? (
                          <a href={info.links[idx]} className="text-emerald-700 font-semibold hover:underline">
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

            {/* Redes Sociales (Sin SemahnChiapas Twitter) */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4">{t("contact.followUs")}</h3>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/ZoomatOficial/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/zoomatoficial_/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.tiktok.com/@zoomat.oficial" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition">
                  <Tiktok className="w-6 h-6" />
                </a>
              </div>
              <p className="text-emerald-100/90 text-xs mt-4 font-medium">
                {t("contact.shareHashtag")}
              </p>
            </div>
          </div>
        </div>

        {/* Departamentos */}
        <section className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-3xl font-bold text-emerald-950 mb-6">{t("contact.departmentsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50/70 to-stone-50 rounded-xl p-6 border border-emerald-200/80 shadow-xs">
                <h3 className="font-bold text-lg text-emerald-900 mb-2">{dept.name}</h3>
                <p className="text-sm text-stone-600 mb-4">{dept.description}</p>
                <div className="space-y-1 text-sm font-medium">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span className="break-all">{dept.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Apoyo */}
        <section className="mt-12 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-xl p-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-emerald-300 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4">{t("contact.supportTitle")}</h2>
          <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            {t("contact.supportDesc")}
          </p>
          <button className="bg-white text-emerald-900 px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-50 transition shadow-md">
            {t("contact.supportBtn")}
          </button>
        </section>
      </div>
    </div>
  );
}
