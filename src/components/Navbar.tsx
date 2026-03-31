import { Menu, X, MapPin, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Link } from 'react-router';
import headerLogo from 'figma:asset/c9bb87ab616765af1c588f478ac253c1180697f3.png';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '/#inicio' },
    { name: 'Animales', href: '/#animales' },
    { name: 'Información', href: '/#info' },
    { name: 'Contacto', href: '/#contacto' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={headerLogo} alt="Zoomat Logo" className="h-12 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button variant="outline" size="icon" className="text-gray-600">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    Administración
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
