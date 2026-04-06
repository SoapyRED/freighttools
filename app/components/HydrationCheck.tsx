'use client';

import { useEffect, useState } from 'react';

/**
 * Invisible marker that confirms JS has hydrated successfully.
 * Inspect the DOM for <span data-hydrated="true"> to verify.
 * Also logs hydration timing to console for debugging.
 */
export default function HydrationCheck() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof performance !== 'undefined') {
      const timing = Math.round(performance.now());
      console.log(`[FreightUtils] Hydrated in ${timing}ms`);
    }
  }, []);

  if (!hydrated) return null;
  return <span data-hydrated="true" style={{ display: 'none' }} />;
}
