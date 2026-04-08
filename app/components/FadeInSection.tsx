'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Wraps children in a container that fades in + slides up
 * when it enters the viewport. Uses IntersectionObserver.
 * Respects prefers-reduced-motion.
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
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
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
