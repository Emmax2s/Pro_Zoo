import { Facebook, Instagram, Twitter, Youtube, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import footerLogo from '../assets/logo-zoomat.png';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { t, language } = useLanguage();

  const handleNavClick = (href: string) => {
    if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('/')) {
      const sectionId = href.replace('/', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer id="contacto" className="bg-emerald-950 text-white py-14 border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* About & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={footerLogo}
                alt="Zoológico Regional Miguel Álvarez del Toro"
                className="h-24 md:h-28 w-auto bg-white/95 rounded-2xl p-2 shadow-lg"
              />
              <div>
                <h3 className="font-black text-2xl text-white leading-tight">ZooMAT</h3>
                <p className="text-sm text-emerald-300 font-bold">Zoológico Regional Miguel Álvarez del Toro</p>
              </div>
            </div>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              {t.footer.about}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-800 pb-2">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-emerald-100 text-sm font-medium">
              <li>
                <button onClick={() => handleNavClick('/')} className="hover:text-emerald-300 transition-colors">
                  {t.navbar.home}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/animales')} className="hover:text-emerald-300 transition-colors">
                  {t.navbar.animals}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/info')} className="hover:text-emerald-300 transition-colors">
                  {t.navbar.info}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/contacto')} className="hover:text-emerald-300 transition-colors">
                  {t.navbar.contact}
                </button>
              </li>
              <li className="pt-2">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-200 transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{language === 'en' ? 'Admin Portal' : 'Acceso Administrativo'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-800 pb-2">{t.footer.followUs}</h3>
            <p className="text-emerald-100/80 text-xs mb-4">
              {language === 'en' ? 'Stay connected with ZooMAT conservation updates.' : 'Conéctate con las actualizaciones de conservación del ZooMAT.'}
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors text-emerald-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors text-emerald-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors text-emerald-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors text-emerald-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900 pt-6 text-center text-emerald-200/70 text-xs">
          <p>&copy; {new Date().getFullYear()} ZooMAT - Zoológico Regional Miguel Álvarez del Toro. {t.footer.rightsReserved}</p>
        </div>
      </div>
    </footer>
  );
}

