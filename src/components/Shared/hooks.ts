import { useCallback, useEffect, useRef, useState } from 'react';
import { SubAppId } from '../../types';

const STORAGE_SYNC_EVENT = 'party_channels_storage_sync';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * useState dat automatisch in localStorage bewaard wordt.
 * Meerdere kanalen die dezelfde sleutel gebruiken blijven met elkaar in sync,
 * ook als ze tegelijk (verborgen) gemount zijn.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJSON(key, initial));
  const initialRef = useRef(initial);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string; source?: unknown } | undefined;
      if (detail?.key === key && detail.source !== setValue) {
        setValue(readJSON(key, initialRef.current));
      }
    };
    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      setValue(resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Opslag vol of geblokkeerd: het spel werkt gewoon door zonder te bewaren
      }
      window.dispatchEvent(
        new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key, source: setValue } })
      );
    },
    [key]
  );

  return [value, update] as const;
}

/** Luistert naar de universele reset-knop rechtsboven in de navigatiebalk. */
export function useGameReset(appId: SubAppId, onReset: () => void) {
  const handlerRef = useRef(onReset);
  handlerRef.current = onReset;

  useEffect(() => {
    const handle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { app?: string } | undefined;
      if (detail?.app === appId) handlerRef.current();
    };
    window.addEventListener('party_game_reset', handle);
    return () => window.removeEventListener('party_game_reset', handle);
  }, [appId]);
}

/** Houdt het scherm aan zolang `active` waar is (handig tijdens een lopende ronde). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock) return;

    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = () => {
      nav.wakeLock
        ?.request('screen')
        .then(lock => {
          if (cancelled) {
            lock.release().catch(() => {});
          } else {
            sentinel = lock;
          }
        })
        .catch(() => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}

export function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Trillen wordt niet ondersteund
  }
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Eén gedeelde spelerslijst voor de nieuwe kanalen. */
export const SHARED_PLAYERS_KEY = 'party_channels_shared_players_v1';

export function useSharedPlayers() {
  return usePersistentState<string[]>(SHARED_PLAYERS_KEY, []);
}
