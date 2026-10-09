import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
      navigate((location.state as { from?: string } | null)?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-5">
        <h1 className="text-2xl font-black text-emerald-900">Acceso administrativo</h1>
        <p className="text-sm text-gray-500">Usa tu usuario o correo y contraseña.</p>
        {error && <p role="alert" className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
        <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario o correo" className="w-full border rounded-xl px-4 py-3" />
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full border rounded-xl px-4 py-3" />
        <button disabled={busy} className="w-full rounded-xl bg-emerald-700 text-white py-3 font-bold disabled:opacity-60">{busy ? "Entrando..." : "Entrar"}</button>
        <Link to="/recuperar-cuenta" className="block text-center text-sm text-emerald-700 hover:underline">¿Olvidaste tu contraseña?</Link>
      </form>
    </main>
  );
}
