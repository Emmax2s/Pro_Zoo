import { useState } from "react";
import { useNavigate } from "react-router";

const TEMP_ADMIN_USERNAME = "admin";
const TEMP_ADMIN_PASSWORD = "zoomat-admin-2026";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");
    setIsLoading(true);

    if (username === TEMP_ADMIN_USERNAME && password === TEMP_ADMIN_PASSWORD) {
      sessionStorage.setItem("pro-zoo-admin-auth", "ok");
      sessionStorage.setItem("pro-zoo-admin-token", "temp-local-token");
      navigate("/admin");
      setIsLoading(false);
      return;
    }

    setError("Credenciales incorrectas");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-700">
          Login Admin
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Usuario"
          className="border p-2 w-full mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Ingresa la contraseña"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Cargando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}