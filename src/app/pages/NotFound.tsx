import { Link } from "react-router";
import { Home, Search, AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <AlertCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
          <h1 className="text-9xl font-bold text-green-800 mb-4">404</h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Página No Encontrada</h2>
          <p className="text-xl text-gray-600 mb-8">
            Lo sentimos, la página que buscas parece haberse perdido en la selva...
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-4">¿Qué puedes hacer?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
            <Link
              to="/animales"
              className="inline-flex items-center justify-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
            >
              <Search className="w-5 h-5" />
              Ver Animales
            </Link>
          </div>
        </div>

        <div className="text-gray-600">
          <p className="mb-2">Si crees que esto es un error, por favor contáctanos:</p>
          <Link to="/contacto" className="text-green-700 hover:text-green-800 font-semibold underline">
            Ir a Contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
