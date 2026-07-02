import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
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

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-emerald-950 text-emerald-100 mt-20 border-t-4 border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Acerca del ZooMAT */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-800 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                Z
              </div>
              <h3 className="font-semibold text-white tracking-tight text-xl">ZooMAT</h3>
            </div>
            <p className="text-emerald-200/80 text-sm leading-relaxed">
              {t("footer.about")}
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold text-sm text-emerald-400 uppercase tracking-widest mb-6">{t("footer.explore")}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/animales" className="text-emerald-200/80 hover:text-white transition-colors">
                  {t("nav.animals")}
                </Link>
              </li>
              <li>
                <Link to="/visita" className="text-emerald-200/80 hover:text-white transition-colors">
                  {t("nav.visit")}
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-emerald-200/80 hover:text-white transition-colors">
                  {t("nav.map")}
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-emerald-200/80 hover:text-white transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-sm text-emerald-400 uppercase tracking-widest mb-6">{t("footer.contact")}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-emerald-200/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>Calzada Cerro Hueco S/N<br />Tuxtla Gutiérrez, Chiapas</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-200/80">
                <Phone className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <a href="tel:+529616144700" className="hover:text-white transition-colors">(961) 614 4700</a>
              </li>
              <li className="flex items-center gap-3 text-emerald-200/80">
                <Mail className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <a href="mailto:zoomat@zoomat.chiapas.gob.mx" className="hover:text-white transition-colors">zoomat@zoomat.chiapas.gob.mx</a>
              </li>
            </ul>
          </div>

          {/* Horarios y Redes */}
          <div>
            <h3 className="font-semibold text-sm text-emerald-400 uppercase tracking-widest mb-6">{t("footer.hours")}</h3>
            <div className="flex items-start gap-3 text-emerald-200/80 text-sm mb-8">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              <div>
                <p>Martes a Domingo</p>
                <p className="font-medium text-white mt-0.5">9:00 - 17:00</p>
                <p className="text-xs text-emerald-400/60 mt-1">{t("footer.closed")}</p>
              </div>
            </div>
            <div>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/ZoomatOficial/" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/zoomatoficial_/" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://twitter.com/SemahnChiapas" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://www.tiktok.com/@zoomat.oficial" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors">
                  <Tiktok className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-500">
          <p>&copy; {new Date().getFullYear()} ZooMAT. {t("footer.rights")}</p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-emerald-300 transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terminos" className="hover:text-emerald-300 transition-colors">{t("footer.terms")}</Link>
            <Link to="/admin" className="hover:text-emerald-300 transition-colors">{t("footer.adminPortal")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
