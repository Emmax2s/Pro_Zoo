import { v4 as uuidv4 } from 'crypto';

interface VisitData {
  speciesId: string;
  language: string;
  durationSeconds: number;
  accessedVia: string;
}

// Generate or get visitor ID
const getVisitorId = (): string => {
  const STORAGE_KEY = 'pro-zoo-visitor-id';
  let visitorId = localStorage.getItem(STORAGE_KEY);

  if (!visitorId) {
    visitorId = 'visitor-' + Math.random().toString(36).substr(2, 9);
    try {
      localStorage.setItem(STORAGE_KEY, visitorId);
    } catch {
      // Ignore storage errors
    }
  }

  return visitorId;
};

// Track a species visit with debouncing to avoid spam
const pendingRequests = new Map<string, NodeJS.Timeout>();

export const recordSpeciesVisit = async (
  speciesId: string,
  language: string = 'es',
  durationSeconds: number = 0,
  accessedVia: string = 'direct'
): Promise<void> => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!apiUrl) {
    console.warn('API_BASE_URL not configured, skipping analytics');
    return;
  }

  const visitorId = getVisitorId();
  const key = `${speciesId}-${visitorId}`;

  // Clear any pending request for this species
  if (pendingRequests.has(key)) {
    clearTimeout(pendingRequests.get(key));
  }

  // Debounce the request by 2 seconds
  const timeoutId = setTimeout(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/analytics/${speciesId}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorId,
          language,
          durationSeconds,
          accessedVia,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to record visit:', response.statusText);
      }
    } catch (error) {
      console.warn('Error recording visit:', error);
    }

    pendingRequests.delete(key);
  }, 2000);

  pendingRequests.set(key, timeoutId);
};

// Track time spent on a page
export class PageTimer {
  private startTime: number;
  private pausedTime: number = 0;
  private isPaused: boolean = false;

  constructor() {
    this.startTime = Date.now();
  }

  pause(): void {
    if (!this.isPaused) {
      this.pausedTime = Date.now();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.startTime += Date.now() - this.pausedTime;
      this.isPaused = false;
    }
  }

  getDuration(): number {
    const now = this.isPaused ? this.pausedTime : Date.now();
    return Math.floor((now - this.startTime) / 1000);
  }

  reset(): void {
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.isPaused = false;
  }
}

// Create a mutation observer to detect when user leaves the page
export const setupPageVisibilityTracking = (
  speciesId: string,
  language: string,
  timer: PageTimer
): (() => void) => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      timer.pause();
    } else {
      timer.resume();
    }
  };

  const handleBeforeUnload = () => {
    const duration = timer.getDuration();
    if (duration > 5) {
      // Only record if user spent more than 5 seconds
      recordSpeciesVisit(speciesId, language, duration);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// Analytics summary hook data
export interface AnalyticsSummary {
  speciesId: number;
  speciesName: string;
  totalVisits: number;
  uniqueVisitors: number;
  averageDuration: number;
  visitsByLanguage: Record<string, number>;
  accessMethods: Record<string, number>;
  hourlyData: Array<{ hour: string; visits: number }>;
  recentVisits: Array<{
    timestamp: string;
    visitor_language: string;
    duration_seconds: number;
    accessed_via: string;
  }>;
  generatedAt: string;
}

export const fetchAnalytics = async (
  speciesId: string,
  adminKey: string
): Promise<AnalyticsSummary | null> => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!apiUrl) {
    console.warn('API_BASE_URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/api/analytics/${speciesId}/analytics`, {
      method: 'GET',
      headers: {
        'x-admin-key': adminKey,
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch analytics:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching analytics:', error);
    return null;
  }
};
