import QRCode from 'qrcode';
import { CourseTemplate, PubItem, DrinkItem, ChallengeItem } from '../types';

interface CompactSharedRoute {
  v: 1;
  n: string; // name
  c?: string; // city
  p: [string, string?][]; // [name, location]
  d: [string, string?][]; // [name, category]
  ch: [string, string?, string?][]; // [title, description, type]
}

/**
 * Encodes a CourseTemplate into a compact URL-safe string
 */
export function encodeRouteToShareCode(template: {
  name: string;
  city?: string;
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
}): string {
  const compact: CompactSharedRoute = {
    v: 1,
    n: template.name.trim(),
    c: template.city?.trim() || undefined,
    p: template.pubs.map((p) => [p.name.trim(), p.location?.trim() || undefined]),
    d: template.drinks.map((d) => [d.name.trim(), d.category?.trim() || undefined]),
    ch: template.challenges.map((c) => [c.title.trim(), c.description?.trim() || undefined, c.type]),
  };

  const json = JSON.stringify(compact);
  // UTF-8 safe base64
  const base64 = btoa(unescape(encodeURIComponent(json)));
  // URL-safe replacement
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a share code back into a full CourseTemplate
 */
export function decodeRouteFromShareCode(code: string): CourseTemplate | null {
  try {
    if (!code || typeof code !== 'string') return null;

    // Clean any prefix if the user pasted a full URL or code with prefix
    let cleanCode = code.trim();
    if (cleanCode.includes('route=')) {
      const match = cleanCode.match(/[?&]route=([^&#]+)/);
      if (match) cleanCode = match[1];
    } else if (cleanCode.includes('#route=')) {
      const match = cleanCode.match(/#route=([^&#]+)/);
      if (match) cleanCode = match[1];
    }

    // Restore standard base64 characters
    let base64 = cleanCode.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json) as CompactSharedRoute;

    if (!parsed || parsed.v !== 1 || !parsed.n || !Array.isArray(parsed.p)) {
      return null;
    }

    const timestamp = Date.now();

    const pubs: PubItem[] = parsed.p.map((item, idx) => ({
      id: `p-shared-${timestamp}-${idx}`,
      name: item[0],
      location: item[1] || undefined,
    }));

    const drinks: DrinkItem[] = Array.isArray(parsed.d)
      ? parsed.d.map((item, idx) => ({
          id: `d-shared-${timestamp}-${idx}`,
          name: item[0],
          category: item[1] || 'Drankje',
        }))
      : [];

    const challenges: ChallengeItem[] = Array.isArray(parsed.ch)
      ? parsed.ch.map((item, idx) => ({
          id: `c-shared-${timestamp}-${idx}`,
          title: item[0],
          description: item[1] || '',
          type: (item[2] as 'challenge' | 'punishment') || 'challenge',
        }))
      : [];

    return {
      id: `tpl-shared-${timestamp}`,
      name: parsed.n,
      city: parsed.c,
      pubs,
      drinks,
      challenges,
      createdAt: timestamp,
    };
  } catch (err) {
    console.error('Fout bij het decoderen van gedeelde route:', err);
    return null;
  }
}

/**
 * Builds a shareable webapp URL for a route
 */
export function generateShareableUrl(template: {
  name: string;
  city?: string;
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
}): string {
  const code = encodeRouteToShareCode(template);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?route=${code}`;
}

/**
 * Generates a QR Code as a Data URL for instant camera scanning
 */
export async function generateRouteQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      margin: 1.5,
      width: 280,
      color: {
        dark: '#051710',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Fout bij het genereren van QR code:', err);
    return '';
  }
}

/**
 * Checks current window URL for an incoming shared route parameter (?route=...)
 */
export function checkForSharedRouteInUrl(): CourseTemplate | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const routeParam = searchParams.get('route');
    if (routeParam) {
      return decodeRouteFromShareCode(routeParam);
    }

    // Also check hash #route=...
    const hash = window.location.hash;
    if (hash && hash.includes('route=')) {
      const match = hash.match(/route=([^&]+)/);
      if (match) {
        return decodeRouteFromShareCode(match[1]);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the ?route= parameter from the address bar without reloading
 */
export function clearRouteParamFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('route');
    if (url.hash.includes('route=')) {
      url.hash = '';
    }
    window.history.replaceState({}, document.title, url.toString());
  } catch (err) {
    console.error('Kon URL niet opschonen:', err);
  }
}
