import QRCode from 'qrcode';

export interface SavedWheel {
  id: string;
  name: string;
  slices: string[];
  createdAt: number;
}

interface CompactSharedWheel {
  v: 1;
  n: string; // name
  s: string[]; // slice texts
}

const STORAGE_KEY = 'saved_custom_wheels';

/**
 * Loads all saved custom wheels from localStorage
 */
export function loadSavedWheels(): SavedWheel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved wheels:', err);
    return [];
  }
}

/**
 * Saves a new or updated wheel to localStorage
 */
export function saveCustomWheel(name: string, slices: string[]): SavedWheel {
  const existing = loadSavedWheels();
  const trimmedName = name.trim() || 'Mijn Rad';
  const newWheel: SavedWheel = {
    id: 'wheel_' + Date.now().toString(),
    name: trimmedName,
    slices: slices.map(s => s.trim()).filter(Boolean),
    createdAt: Date.now(),
  };

  const updated = [newWheel, ...existing.filter(w => w.name !== trimmedName)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newWheel;
}

/**
 * Deletes a saved wheel
 */
export function deleteSavedWheel(id: string): SavedWheel[] {
  const existing = loadSavedWheels();
  const filtered = existing.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

/**
 * Encodes a wheel into a compact URL-safe base64 string
 */
export function encodeWheelToShareCode(name: string, slices: string[]): string {
  const compact: CompactSharedWheel = {
    v: 1,
    n: name.trim() || 'Party Rad',
    s: slices.map(s => s.trim()).filter(Boolean),
  };

  const json = JSON.stringify(compact);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a share code back into wheel name and slices
 */
export function decodeWheelFromShareCode(code: string): { name: string; slices: string[] } | null {
  try {
    if (!code || typeof code !== 'string') return null;

    let cleanCode = code.trim();
    if (cleanCode.includes('wheel=')) {
      const match = cleanCode.match(/[?&]wheel=([^&#]+)/);
      if (match) cleanCode = match[1];
    } else if (cleanCode.includes('#wheel=')) {
      const match = cleanCode.match(/#wheel=([^&#]+)/);
      if (match) cleanCode = match[1];
    }

    let base64 = cleanCode.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = decodeURIComponent(escape(atob(base64)));
    const compact: CompactSharedWheel = JSON.parse(json);

    if (compact.v !== 1 || !Array.isArray(compact.s) || compact.s.length < 2) {
      return null;
    }

    return {
      name: compact.n || 'Gedeeld Rad',
      slices: compact.s,
    };
  } catch (err) {
    console.error('Failed to decode wheel share code:', err);
    return null;
  }
}

/**
 * Generates full share URL
 */
export function generateWheelShareUrl(name: string, slices: string[]): string {
  const code = encodeWheelToShareCode(name, slices);
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?wheel=${code}`;
}

/**
 * Generates QR Code data URL
 */
export async function generateWheelQRCode(name: string, slices: string[]): Promise<string> {
  const url = generateWheelShareUrl(name, slices);
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 7,
    color: {
      dark: '#0369a1',
      light: '#ffffff',
    },
  });
}

/**
 * Check for incoming wheel in URL parameter ?wheel=...
 */
export function checkForSharedWheelInUrl(): { name: string; slices: string[] } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const wheelCode = params.get('wheel');
    if (wheelCode) {
      return decodeWheelFromShareCode(wheelCode);
    }
  } catch (err) {
    console.error('Failed to parse wheel param:', err);
  }
  return null;
}

/**
 * Removes the ?wheel= query parameter without reloading
 */
export function clearWheelParamFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('wheel');
  window.history.replaceState({}, document.title, url.toString());
}
