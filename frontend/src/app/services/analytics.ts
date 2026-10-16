// Analytics and QR Tracking Service for ZooMAT

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export interface QRScanRecord {
  speciesId: number;
  timestamp: number;
  language: string;
  accessedVia: "qr" | "direct";
}

export interface AnalyticsStorage {
  totalVisitors: number;
  totalQrScans: number;
  scansBySpecies: Record<number, number>;
  history: QRScanRecord[];
}

const STORAGE_KEY = "zoomat_analytics_data";
const SESSION_VISITOR_KEY = "zoomat_visitor_session_recorded";

function getStoredData(): AnalyticsStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        totalVisitors: Math.max(0, Number(parsed.totalVisitors) || 0),
        totalQrScans: Math.max(0, Number(parsed.totalQrScans) || 0),
        scansBySpecies: parsed.scansBySpecies || {},
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch (e) {
    console.warn("Error reading analytics from localStorage:", e);
  }

  return {
    totalVisitors: 0,
    totalQrScans: 0,
    scansBySpecies: {},
    history: [],
  };
}

function saveStoredData(data: AnalyticsStorage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Error saving analytics to localStorage:", e);
  }
}

/**
 * Record a general site visit (once per browser session)
 */
export function recordGeneralVisit() {
  if (typeof window === "undefined") return;
  try {
    const sessionKey = "zoomat_visit_" + new Date().toISOString().slice(0, 10);
    const alreadyCounted = sessionStorage.getItem(sessionKey);
    const data = getStoredData();

    if (!alreadyCounted) {
      sessionStorage.setItem(sessionKey, "true");
      data.totalVisitors += 1;
      saveStoredData(data);
    }

  } catch (e) {
    console.warn("Unable to record general visit:", e);
  }
}

/**
 * Record a QR scan or direct species visit
 */
export function recordSpeciesVisit(
  speciesId: number,
  language: string = "es",
  accessedVia: "qr" | "direct" = "qr"
) {
  if (typeof window === "undefined") return;

  const data = getStoredData();
  if (accessedVia === "qr") {
    data.totalQrScans += 1;
    data.scansBySpecies[speciesId] = (data.scansBySpecies[speciesId] || 0) + 1;
    data.history.push({
      speciesId,
      timestamp: Date.now(),
      language,
      accessedVia: "qr",
    });
    saveStoredData(data);
  }

  // Also notify backend if configured
  if (API_BASE_URL) {
    fetch(`${API_BASE_URL}/api/analytics/${encodeURIComponent(speciesId)}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        accessedVia,
        durationSeconds: 15,
      }),
    }).catch(() => {
      // Backend may be offline in dev, ignore
    });
  }
}

/**
 * Get visit summary for dashboard
 */
export function getVisitSummary(_periodDays: number = 30) {
  const data = getStoredData();

  const result = Object.entries(data.scansBySpecies).map(([idStr, rawCount]) => {
    const speciesId = Number(idStr);
    const count = Number(rawCount) || 0;
    return {
      speciesId,
      totalVisits: count,
      uniqueVisitors: count,
      averageDuration: 45,
    };
  });

  return {
    totalVisitors: Math.max(0, Number(data.totalVisitors) || 0),
    totalQrVisits: Number(data.totalQrScans) || 0,
    summary: result,
  };
}
