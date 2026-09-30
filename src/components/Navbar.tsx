import { Menu, X, QrCode, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import logoZoomat from '../assets/logo-zoomat.png';
import { useLanguage } from '../contexts/LanguageContext';
import { QrDownloadModal } from './QrDownloadModal';
import { Button } from './ui/button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href === '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('/')) {
      const sectionId = href.replace('/', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(href);
      }
    }
  };

  const navLinks = [
    { name: t.navbar.home, href: '/' },
    { name: t.navbar.animals, href: '/animales' },
    { name: t.navbar.info, href: '/info' },
    { name: t.navbar.contact, href: '/contacto' },
  ];

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28 md:h-32">
            {/* Logo oficial ZooMAT (Enlarged) */}
            <Link to="/" className="flex items-center space-x-4 group">
              <img
                src={logoZoomat}
                alt="Logo ZooMAT"
                className="h-20 md:h-24 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-emerald-950 leading-tight">
                  ZooMAT
                </span>
                <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                  Miguel Álvarez del Toro
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-stone-700 hover:text-emerald-700 font-semibold transition-colors text-sm"
                >
                  {link.name}
                </button>
              ))}

              {/* QR Modal Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-semibold gap-1.5 shadow-xs"
              >
                <QrCode className="h-4 w-4 text-emerald-600" />
                <span>{language === 'en' ? 'QR & Downloads' : 'Códigos QR'}</span>
              </Button>

              {/* Admin Quick Link */}
              <Link to="/admin">
                <Button size="sm" className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>

              {/* Language Selector */}
              <label className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg">
                <span>🌐</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as 'es' | 'en')}
                  className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
                  aria-label={t.navbar.languageLabel}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="border-emerald-600 text-emerald-800 p-2"
              >
                <QrCode className="h-5 w-5" />
              </Button>
              <button
                className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 border-t border-stone-100 pt-4">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left text-stone-800 font-semibold hover:text-emerald-700 py-1"
                  >
                    {link.name}
                  </button>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="bg-emerald-800 text-white font-semibold gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Panel Admin</span>
                    </Button>
                  </Link>

                  <label className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg">
                    <span>🌐</span>
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as 'es' | 'en')}
                      className="bg-transparent font-medium text-stone-800"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal de Códigos QR */}
      <QrDownloadModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
}

