import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoZoomat from "../../../assets/logo-zoomat.png";

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

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-stone-950 text-stone-200 mt-20 border-t-4 border-[#2b1706] shadow-2xl relative">
      {/* Top rustic wood bar */}
      <div className="wood-texture-bg h-5 sm:h-6 w-full border-b-2 border-amber-950/80 shadow-md" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Acerca del Zoo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={logoZoomat}
                alt="Logo Oficial"
                className="w-16 h-16 rounded-full object-contain bg-white p-1 shadow-lg border-2 border-amber-500"
              />
              <div>
                <h3 className="font-adventure text-amber-300 tracking-wide text-2xl leading-none">ZOO GDL</h3>
                <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider mt-1">Dejando Huella</p>
              </div>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed font-normal">
              Reserva natural y zoológico dedicado a la conservación de especies, investigación científica y experiencias educativas para toda la familia.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-adventure text-lg text-amber-400 uppercase tracking-wider mb-6 pb-2 border-b border-stone-800">{t("footer.explore")}</h3>
            <ul className="space-y-3.5 text-base font-semibold">
              <li>
                <Link to="/animales" className="text-stone-300 hover:text-amber-300 hover:translate-x-1 inline-block transition-transform">
                  {t("nav.animals")}
                </Link>
              </li>
              <li>
                <Link to="/visita" className="text-stone-300 hover:text-amber-300 hover:translate-x-1 inline-block transition-transform">
                  {t("nav.visit")}
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-stone-300 hover:text-amber-300 hover:translate-x-1 inline-block transition-transform">
                  {t("nav.map")}
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-stone-300 hover:text-amber-300 hover:translate-x-1 inline-block transition-transform">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link to="/redes" className="text-stone-300 hover:text-amber-300 hover:translate-x-1 inline-block transition-transform">
                  Redes Oficiales
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-adventure text-lg text-amber-400 uppercase tracking-wider mb-6 pb-2 border-b border-stone-800">{t("footer.contact")}</h3>
            <ul className="space-y-4 text-base font-medium">
              <li className="flex items-start gap-3.5 text-stone-300">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-amber-400" />
                <span className="leading-snug">Calzada Cerro Hueco S/N<br />Col. Zapotal, Tuxtla Gutiérrez, Chiapas</span>
              </li>
              <li className="flex items-center gap-3.5 text-stone-300">
                <Phone className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <a href="tel:+529616144700" className="hover:text-amber-300 transition-colors font-bold">(961) 614 4700</a>
              </li>
              <li className="flex items-center gap-3.5 text-stone-300">
                <Mail className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <a href="mailto:zoomat@zoomat.chiapas.gob.mx" className="hover:text-amber-300 transition-colors font-medium text-sm sm:text-base break-all">contacto@zoologico.gob.mx</a>
              </li>
            </ul>
          </div>

          {/* Horarios y Redes */}
          <div>
            <h3 className="font-adventure text-lg text-amber-400 uppercase tracking-wider mb-6 pb-2 border-b border-stone-800">{t("footer.hours")}</h3>
            <div className="flex items-start gap-3.5 text-stone-300 text-base mb-8 bg-stone-900 p-4 rounded-xl border border-stone-800">
              <Clock className="w-5 h-5 mt-1 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-bold text-white">Martes a Domingo</p>
                <p className="font-adventure text-amber-300 text-xl mt-0.5">9:00 AM - 5:00 PM</p>
                <p className="text-xs text-stone-400 mt-1 font-medium">{t("footer.closed")}</p>
              </div>
            </div>
            <div>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-stone-900 border border-stone-700 p-3 rounded-xl text-amber-200 hover:text-white hover:bg-stone-800 transition-all hover:scale-110 shadow-sm">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-stone-900 border border-stone-700 p-3 rounded-xl text-amber-200 hover:text-white hover:bg-stone-800 transition-all hover:scale-110 shadow-sm">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-stone-900 border border-stone-700 p-3 rounded-xl text-amber-200 hover:text-white hover:bg-stone-800 transition-all hover:scale-110 shadow-sm">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-emerald-400">
          <p>&copy; {new Date().getFullYear()} ZooMAT - Miguel Álvarez del Toro. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm font-semibold">
            <Link to="/privacidad" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terminos" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
