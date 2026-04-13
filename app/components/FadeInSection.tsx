'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Wraps children in a container that fades in + slides up
 * when it enters the viewport. Uses IntersectionObserver.
 * Respects prefers-reduced-motion. Falls back to visible after 500ms.
 */
export default function FadeInSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) { setVisible(true); return; }

    // Fallback: force visible after 500ms if observer hasn't fired
    const fallback = setTimeout(() => setVisible(true), 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallback);
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in-section${visible ? ' visible' : ''}`}
    >
      {children}
    </div>
  );
}
