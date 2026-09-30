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
    <footer className="bg-emerald-950 text-emerald-100 mt-24 border-t-4 border-emerald-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Acerca del ZooMAT */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={logoZoomat}
                alt="Logo Oficial ZooMAT"
                className="w-16 h-16 rounded-full object-contain bg-white p-1 shadow-lg border-2 border-emerald-400"
              />
              <div>
                <h3 className="font-black text-white tracking-tight text-2xl leading-none">ZooMAT</h3>
                <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mt-1">Miguel Álvarez del Toro</p>
              </div>
            </div>
            <p className="text-emerald-100 text-base leading-relaxed font-normal">
              {t("footer.about")}
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-bold text-base text-emerald-400 uppercase tracking-wider mb-6 pb-2 border-b border-emerald-800">{t("footer.explore")}</h3>
            <ul className="space-y-3.5 text-base font-semibold">
              <li>
                <Link to="/animales" className="text-emerald-100 hover:text-white hover:translate-x-1 inline-block transition-transform">
                  {t("nav.animals")}
                </Link>
              </li>
              <li>
                <Link to="/visita" className="text-emerald-100 hover:text-white hover:translate-x-1 inline-block transition-transform">
                  {t("nav.visit")}
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-emerald-100 hover:text-white hover:translate-x-1 inline-block transition-transform">
                  {t("nav.map")}
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-emerald-100 hover:text-white hover:translate-x-1 inline-block transition-transform">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link to="/redes" className="text-emerald-100 hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Redes Oficiales
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-base text-emerald-400 uppercase tracking-wider mb-6 pb-2 border-b border-emerald-800">{t("footer.contact")}</h3>
            <ul className="space-y-4 text-base font-medium">
              <li className="flex items-start gap-3.5 text-emerald-100">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-amber-400" />
                <span className="leading-snug">Calzada Cerro Hueco S/N<br />Col. Zapotal, Tuxtla Gutiérrez, Chiapas</span>
              </li>
              <li className="flex items-center gap-3.5 text-emerald-100">
                <Phone className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <a href="tel:+529616144700" className="hover:text-white transition-colors font-bold">(961) 614 4700</a>
              </li>
              <li className="flex items-center gap-3.5 text-emerald-100">
                <Mail className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <a href="mailto:zoomat@zoomat.chiapas.gob.mx" className="hover:text-white transition-colors font-medium text-sm sm:text-base break-all">zoomat@zoomat.chiapas.gob.mx</a>
              </li>
            </ul>
          </div>

          {/* Horarios y Redes */}
          <div>
            <h3 className="font-bold text-base text-emerald-400 uppercase tracking-wider mb-6 pb-2 border-b border-emerald-800">{t("footer.hours")}</h3>
            <div className="flex items-start gap-3.5 text-emerald-100 text-base mb-8 bg-emerald-900/60 p-4 rounded-xl border border-emerald-800">
              <Clock className="w-5 h-5 mt-1 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-bold text-white">Martes a Domingo</p>
                <p className="font-extrabold text-amber-300 text-lg mt-0.5">8:30 AM - 4:30 PM</p>
                <p className="text-sm text-emerald-300 mt-1 font-medium">{t("footer.closed")}</p>
              </div>
            </div>
            <div>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/ZoomatOficial/" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-3 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-all hover:scale-110 shadow-sm">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/zoomatoficial_/" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-3 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-all hover:scale-110 shadow-sm">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.tiktok.com/@zoomat.oficial" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-3 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-all hover:scale-110 shadow-sm">
                  <Tiktok className="w-6 h-6" />
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
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors font-bold">{t("footer.adminPortal")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
