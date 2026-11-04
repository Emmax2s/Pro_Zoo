// audioPlayer.ts — Robust audio playback and speech synthesis helper

let currentAudio: HTMLAudioElement | null = null;
let activeChunks: string[] = [];
let activeChunkIndex = 0;
let keepAliveTimer: any = null;
let isCancelled = false;

// Play a short pleasant welcome chime using Web Audio API to unlock audio context
export function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Web Audio may be restricted, ignore
  }
}

function clearKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Stop any ongoing audio playback or speech synthesis
 */
export function stopAllAudio() {
  isCancelled = true;
  activeChunks = [];
  activeChunkIndex = 0;
  clearKeepAlive();

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function pauseAllAudio() {
  if (currentAudio) {
    currentAudio.pause();
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeAllAudio() {
  if (currentAudio) {
    void currentAudio.play().catch(() => undefined);
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

/**
 * Splits long text into natural sentence-sized chunks (< 180 chars)
 * to prevent Chromium/Chrome and iOS SpeechSynthesis 15-second cutoff bugs.
 */
function splitIntoChunks(text: string, maxLen = 180): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (current.length + trimmed.length + 1 <= maxLen) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLen) {
        const words = trimmed.split(/\s+/);
        let sub = "";
        for (const w of words) {
          if (sub.length + w.length + 1 <= maxLen) {
            sub = sub ? `${sub} ${w}` : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Resolves available browser voices, waiting for voiceschanged if needed.
 */
function resolveVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 250);
  });
}

function playChunk(
  chunks: string[],
  index: number,
  isEs: boolean,
  voice: SpeechSynthesisVoice | null,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (isCancelled || index >= chunks.length) {
    clearKeepAlive();
    if (onEnd) onEnd();
    return;
  }

  activeChunkIndex = index;
  const chunkText = chunks[index];
  const utterance = new SpeechSynthesisUtterance(chunkText);
  utterance.lang = isEs ? "es-MX" : "en-US";
  utterance.rate = isEs ? 0.95 : 0.92;
  utterance.pitch = 1.0;
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    if (index === 0 && onStart) onStart();
  };

  utterance.onend = () => {
    if (isCancelled) return;
    playChunk(chunks, index + 1, isEs, voice, onStart, onEnd);
  };

  utterance.onerror = (e) => {
    if (isCancelled) return;
    if (index + 1 < chunks.length) {
      playChunk(chunks, index + 1, isEs, voice, onStart, onEnd);
    } else {
      clearKeepAlive();
      if (onEnd) onEnd();
    }
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak animal narration via SpeechSynthesis with chunking, keepalive, and voice matching
 */
export async function speakNarration(
  text: string,
  isEs: boolean,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  stopAllAudio();
  isCancelled = false;

  const chunks = splitIntoChunks(text, 180);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return;
  }
  activeChunks = chunks;

  const voices = await resolveVoices();
  const langPrefix = isEs ? "es" : "en";
  const matchedVoice = voices
    .filter((v) => v.lang.toLowerCase().startsWith(langPrefix))
    .sort((a, b) => {
      const score = (voice: SpeechSynthesisVoice) =>
        /natural|online|google|neural|microsoft/i.test(`${voice.name} ${voice.voiceURI}`) ? 2 : 1;
      return score(b) - score(a);
    })[0] || null;

  // Start keep-alive ping to prevent Chrome's 15s watchdog bug
  clearKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    } else {
      clearKeepAlive();
    }
  }, 9000);

  playChunk(chunks, 0, isEs, matchedVoice, onStart, () => {
    clearKeepAlive();
    if (onEnd) onEnd();
  });
}
