'use client';

import { useEffect, useRef } from 'react';

/**
 * Sync calculator state to URL search params for shareable links.
 * - On mount: reads params from URL and calls `onLoad` with initial values
 * - On state change: updates URL without navigation (replaceState)
 */
export function useUrlSync(
  params: Record<string, string | number | boolean | null | undefined>,
  enabled = true,
) {
  const isInitial = useRef(true);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Skip the first render (initial state) to avoid overwriting URL params
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const url = new URL(window.location.href);
    const sp = url.searchParams;

    // Clear old params
    for (const key of [...sp.keys()]) {
      sp.delete(key);
    }

    // Set new params (skip defaults / empty)
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '' || value === false) continue;
      if (value === true) {
        sp.set(key, '1');
      } else {
        sp.set(key, String(value));
      }
    }

    const newUrl = sp.toString() ? `${url.pathname}?${sp.toString()}` : url.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [params, enabled]);
}

/**
 * Read URL search params on mount. Returns a Record of param values.
 * Call this once in your component to get initial values from the URL.
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const [key, value] of sp.entries()) {
    result[key] = value;
  }
  return result;
}
