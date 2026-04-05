import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import footerLogo from '../assets/logo-zoomat.png';

export function Footer() {
  return (
    <footer id="contacto" className="bg-green-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={footerLogo} alt="Zoológico Regional Miguel Álvarez del Toro" className="h-20 w-auto bg-white rounded-full p-1" />
            </div>
            <p className="text-green-100 text-sm">
              Comprometidos con la conservación de la vida silvestre y la educación ambiental desde 1985.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-green-100 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="/animales" className="hover:text-white transition-colors">Animales</a></li>
              <li><a href="/info" className="hover:text-white transition-colors">Información</a></li>
              <li><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 pt-8 text-center text-green-100 text-sm">
          <p>&copy; 2026 Zoomat. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
