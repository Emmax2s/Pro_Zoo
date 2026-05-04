import { useState } from "react";
import { useNavigate } from "react-router";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

const TEMP_ADMIN_USERNAME = "admin";
const TEMP_ADMIN_PASSWORD = "zoomat-admin-2026";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      // Guardar token y navegar
      if (data.token) {
        sessionStorage.setItem('pro-zoo-admin-token', data.token);
        sessionStorage.setItem('pro-zoo-admin-auth', 'ok');
        navigate('/admin');
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left hero - imagen / marca */}
        <div className="hidden lg:flex relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-[url('/assets/hero-placeholder.jpg')] bg-cover bg-center opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/60" />

          <div className="relative p-10 flex flex-col justify-between text-white w-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M4 19c1.5-3 5-5 8-5s6.5 2 8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Pro Zoo</h3>
                  <p className="text-xs opacity-80">Gestión de especies y contenido</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold leading-tight">Administra tu zoológico<br />de forma segura y fácil</h2>
              <p className="mt-4 text-sm opacity-90 max-w-[28rem]">Crea y edita fichas de animales, controla accesos y actualiza el contenido público sin complicaciones.</p>
            </div>

            <div className="mt-6 text-sm opacity-80">
              <ul className="space-y-2">
                <li>• Panel optimizado para móviles y escritorio</li>
                <li>• Control de versiones y usuarios</li>
                <li>• Subidas y gestión multimedia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-emerald-700">Acceso al Panel</h1>
            <p className="text-sm text-gray-500">Introduce tus credenciales para acceder al panel administrativo</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-1">Correo o usuario</label>
          <input
            type="text"
            inputMode="email"
            placeholder="usuario@ejemplo.com"
            className="w-full px-4 py-3 mb-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            aria-label="Usuario"
          />

          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              aria-label="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Recuérdame
            </label>
            <a href="#" className="text-sm text-emerald-600 hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? 'Cargando...' : 'Entrar al panel'}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <span>¿No tienes acceso? </span>
            <a href="#" className="text-emerald-600 hover:underline">Contacta al administrador</a>
          </div>

          <div className="mt-6 pt-6 border-t mt-8">
            <p className="text-xs text-gray-400">Pro Zoo — Administración interna</p>
          </div>
        </div>
      </div>
    </div>
  );
}