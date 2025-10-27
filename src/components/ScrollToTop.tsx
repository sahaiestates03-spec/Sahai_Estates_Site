// src/components/ScrollToTop.tsx
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // Make SPA always control scroll
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // If there is an in-page anchor (#id), scroll to that element
    if (hash) {
      const id = decodeURIComponent(hash.replace('#', ''));
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
    }

    const scrollToTop = () => {
      // Try all common scroll targets
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // If you use a custom scroll container, it will be handled in Step 3
      const scroller = document.getElementById('scroll-root');
      if (scroller) scroller.scrollTop = 0;
    };

    // Immediately + after paint (some layouts mount async)
    scrollToTop();
    const id2 = setTimeout(scrollToTop, 0);
    return () => clearTimeout(id2);
  }, [pathname, hash]);

  return null;
}
