import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">Error {error.status}</p>
          <h1 className="mt-2 text-2xl text-gray-900">{error.statusText}</h1>
          <p className="mt-3 text-gray-600">
            No encontramos la ruta que intentaste abrir.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-800"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-600">Error inesperado</p>
        <h1 className="mt-2 text-2xl text-gray-900">Algo salió mal</h1>
        <p className="mt-3 text-gray-600">
          Ocurrió un problema al cargar la página.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-800"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
