import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, TreePine, Navigation } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("contact.success"));
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact.phoneTitle"),
      details: ["(961) 614-4700", t("contact.phoneHours")],
      links: ["tel:+529616144700", null],
    },
    {
      icon: Mail,
      title: t("contact.emailTitle"),
      details: ["contacto@zoologico.gob.mx", t("contact.emailResponse")],
      links: ["mailto:contacto@zoologico.gob.mx", null],
    },
    {
      icon: MapPin,
      title: t("contact.addressTitle"),
      details: [t("contact.addressLine1"), t("contact.addressLine2")],
      links: [null, null],
    },
    {
      icon: Clock,
      title: t("contact.hoursTitle"),
      details: [t("contact.hoursLine1"), t("contact.hoursLine2")],
      links: [null, null],
    },
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
              <span>{t("home.hero.tag")}</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.1] text-adventure-shadow">
              {t("contact.title")}
            </h1>

            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-semibold">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-5 sm:h-6 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-10" />
      </section>

      {/* 2. Form & Contact Details */}
      <div className="reveal-on-scroll max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="interactive-card bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#e2d5bd] hover:border-amber-600/30 transition-colors duration-300 will-change-transform">
              <h2 className="font-adventure text-3xl sm:text-4xl text-[#2b1810] mb-8">
                {t("contact.sendMessage")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-extrabold text-stone-900 mb-2">
                      {t("contact.fullName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-amber-900/20 rounded-2xl focus:ring-4 focus:ring-amber-500 focus:border-amber-700 text-base font-semibold bg-[#fcfaf5] transition-all duration-200"
                      placeholder={t("contact.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-extrabold text-stone-900 mb-2">
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-amber-900/20 rounded-2xl focus:ring-4 focus:ring-amber-500 focus:border-amber-700 text-base font-semibold bg-[#fcfaf5] transition-all duration-200"
                      placeholder={t("contact.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-extrabold text-stone-900 mb-2">
                    {t("contact.subject")}
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-amber-900/20 rounded-2xl focus:ring-4 focus:ring-amber-500 focus:border-amber-700 text-base font-semibold bg-[#fcfaf5] transition-all duration-200"
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
                  <label className="block text-base font-extrabold text-stone-900 mb-2">
                    {t("contact.message")}
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-5 py-4 border-2 border-amber-900/20 rounded-2xl focus:ring-4 focus:ring-amber-500 focus:border-amber-700 resize-none text-base font-medium bg-[#fcfaf5] transition-all duration-200"
                    placeholder={t("contact.messagePlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full wood-texture-bg text-amber-200 hover:text-white py-4.5 rounded-2xl font-adventure text-lg border-2 border-amber-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-102 active:translate-y-0.5 active:scale-98 transition-all duration-200 flex items-center justify-center gap-3 wood-button-shadow cursor-pointer will-change-transform"
                >
                  <Send className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  <span>{t("contact.sendButton")}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Contact Cards & Social */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="interactive-card bg-white rounded-3xl shadow-lg p-6 border-2 border-[#e2d5bd] hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 will-change-transform group"
              >
                <div className="flex items-start gap-4">
                  <div className="wood-texture-bg p-3.5 rounded-2xl text-amber-200 border border-amber-600 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-adventure text-xl text-[#2b1810] mb-1">{info.title}</h3>
                    {info.details.filter(Boolean).map((detail, idx) => (
                      <p key={idx} className="text-stone-700 text-base font-medium">
                        {info.links && info.links[idx] ? (
                          <a href={info.links[idx]} className="text-amber-900 font-bold hover:underline">
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

            {/* Redes Oficiales */}
            <div className="wood-texture-bg rounded-3xl shadow-2xl p-7 text-amber-100 border-2 border-amber-600 hover:border-amber-500 transition-colors duration-300">
              <h3 className="font-adventure text-2xl text-amber-200 mb-2">{t("contact.followUs")}</h3>
              <p className="text-amber-100/90 text-sm mb-5 font-medium">
                Sigue las redes oficiales de ZooMAT
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.tiktok.com/@zoomat.oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok Oficial"
                  className="bg-black/40 hover:bg-black/60 p-3.5 rounded-2xl border border-amber-500/40 text-amber-200 hover:text-white transition-all duration-200 hover:scale-115 hover:-translate-y-1 active:scale-90 shadow-md will-change-transform"
                >
                  <Tiktok className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/ZoomatOficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook Oficial"
                  className="bg-black/40 hover:bg-black/60 p-3.5 rounded-2xl border border-amber-500/40 text-amber-200 hover:text-white transition-all duration-200 hover:scale-115 hover:-translate-y-1 active:scale-90 shadow-md will-change-transform"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com/zoomatoficial_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram Oficial"
                  className="bg-black/40 hover:bg-black/60 p-3.5 rounded-2xl border border-amber-500/40 text-amber-200 hover:text-white transition-all duration-200 hover:scale-115 hover:-translate-y-1 active:scale-90 shadow-md will-change-transform"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
              <p className="text-amber-200/90 text-xs mt-5 font-medium">
                Comparte tus fotos con #ZooMAT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
