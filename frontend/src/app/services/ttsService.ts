const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export async function generateServerNarration(text: string, language: "es" | "en") {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, language }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => ({}));
    if (typeof data.url !== "string" || !data.url) return null;
    return data as { url: string; provider: string };
  } catch {
    return null;
  }
}

