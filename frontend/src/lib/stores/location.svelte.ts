export type LocationState = {
  locationId: string;
  displayName: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
};

let current = $state<LocationState | null>(null);

export const locationStore = {
  get current() {
    return current;
  },
  get lastFrostMonth(): number | null {
    if (!current?.lastFrostSpring) return null;
    // Parse "MM-DD" or "YYYY-MM-DD" format
    const parts = current.lastFrostSpring.split('-');
    return parts.length >= 2 ? parseInt(parts[parts.length - 2], 10) : null;
  },
  get firstFrostMonth(): number | null {
    if (!current?.firstFrostAutumn) return null;
    const parts = current.firstFrostAutumn.split('-');
    return parts.length >= 2 ? parseInt(parts[parts.length - 2], 10) : null;
  },
  set(state: LocationState) {
    current = state;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('frostleaf-location', JSON.stringify(state));
    }
  },
  clear() {
    current = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('frostleaf-location');
    }
  },
  init() {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('frostleaf-location');
    if (stored) {
      try {
        current = JSON.parse(stored);
      } catch {
        // ignore
      }
    }
  },
};
