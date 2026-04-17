import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useLanguage();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">Error {error.status}</p>
          <h1 className="mt-2 text-2xl text-gray-900">{error.statusText}</h1>
          <p className="mt-3 text-gray-600">
            {t.routeError.routeNotFound}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-800"
          >
            {t.routeError.backHome}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-600">{t.routeError.unexpectedError}</p>
        <h1 className="mt-2 text-2xl text-gray-900">{t.routeError.somethingWentWrong}</h1>
        <p className="mt-3 text-gray-600">
          {t.routeError.loadProblem}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-800"
        >
          {t.routeError.backHome}
        </Link>
      </div>
    </main>
  );
}
