import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { PublicChatButton } from "../components/PublicChatButton";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export function PasswordRecovery() {
  const [params] = useSearchParams();
  const [requested, setRequested] = useState(Boolean(params.get("token")));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    const endpoint = requested ? "/api/admin/reset-password" : "/api/admin/forgot-password";
    const body = requested ? { email, code, password } : { email };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.message || "No se pudo procesar la solicitud.");
    else {
      setMessage(data.message);
      if (!requested) setRequested(true);
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-5">
        <h1 className="text-2xl font-black text-emerald-900">{requested ? "Verificar identidad" : "Recuperar cuenta"}</h1>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo de la cuenta" className="w-full border rounded-xl px-4 py-3" />
        {requested && <>
          <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="Código de 6 dígitos (10 min)" className="w-full border rounded-xl px-4 py-3" />
          <div className="relative">
            <input required minLength={10} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña (mínimo 10 caracteres)" className="w-full border rounded-xl px-4 py-3 pr-12" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </>}
        {message && <p className="rounded-lg bg-green-50 text-green-700 p-3 text-sm">{message}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
        <button className="w-full rounded-xl bg-emerald-700 text-white py-3 font-bold">{requested ? "Cambiar contraseña" : "Enviar código"}</button>
        <Link to="/login" className="block text-center text-sm text-emerald-700 hover:underline">Volver al acceso</Link>
      </form>
      <PublicChatButton />
    </main>
  );
}
