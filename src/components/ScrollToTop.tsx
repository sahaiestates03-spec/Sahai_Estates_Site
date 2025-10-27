// src/components/ScrollToTop.tsx
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // Disable browser's native restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollNow = () => {
      // If there's an in-page #anchor, go there
      if (hash) {
        const id = decodeURIComponent(hash.replace('#', ''));
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: 'start' });
          return;
        }
      }

      // Try all common targets
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // If you use a custom scroll container, give it id="scroll-root"
      const scroller = document.getElementById('scroll-root');
      if (scroller) scroller.scrollTop = 0;
    };

    // Run immediately + after paint (to beat late-mounted layouts)
    scrollNow();
    requestAnimationFrame(scrollNow);
    setTimeout(scrollNow, 0);
  }, [pathname, hash]);

  return null;
}
