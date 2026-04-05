import { Link } from 'react-router';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-600">404</p>
        <h1 className="mt-2 text-2xl text-gray-900">Página no encontrada</h1>
        <p className="mt-3 text-gray-600">
          La dirección que escribiste no existe en este sitio.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-800"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
