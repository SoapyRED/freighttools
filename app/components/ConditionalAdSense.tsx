'use client';

import { useEffect, useState } from 'react';

/**
 * Only loads the Google AdSense script if the user has accepted all cookies.
 * If cookie_consent is 'necessary' or not set, AdSense is NOT loaded.
 */
export default function ConditionalAdSense() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      setShouldLoad(true);
    }

    // Listen for consent changes (when user clicks Accept All)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cookie_consent' && e.newValue === 'accepted') {
        setShouldLoad(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Also listen for custom event from same-tab consent
    const handleConsent = () => setShouldLoad(true);
    window.addEventListener('cookie-consent-accepted', handleConsent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cookie-consent-accepted', handleConsent);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    // Don't double-inject
    if (document.querySelector('script[src*="adsbygoogle"]')) return;

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3441075477232453';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [shouldLoad]);

  return null;
}
