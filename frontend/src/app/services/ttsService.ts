const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export async function generateServerNarration(text: string, language: "es" | "en") {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.url !== "string") {
    throw new Error(data.message || "No se pudo generar la narración.");
  }
  return data as { url: string; provider: string };
}

