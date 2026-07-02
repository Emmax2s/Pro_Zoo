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
      <div className="w-full max-w-lg bg-white rounded-xl p-8 shadow-md">
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
  );
}