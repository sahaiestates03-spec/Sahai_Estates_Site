// src/components/RotatingHero.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: string[];
  interval?: number;            // ms, default 6000
  heightClass?: string;         // tailwind height classes
  children?: React.ReactNode;   // overlay content
};

export default function RotatingHero({
  images,
  interval = 6000,
  heightClass = "h-[560px] md:h-[620px]",
  children,
}: Props) {
  const cleaned = useMemo(() => (images || []).filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const timerRef = useRef<number | null>(null);
  const reducedMotionRef = useRef<boolean>(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = !!m?.matches;
    const onChange = (e: MediaQueryListEvent) => (reducedMotionRef.current = e.matches);
    m?.addEventListener?.("change", onChange);
    return () => m?.removeEventListener?.("change", onChange);
  }, []);

  // Preload to avoid flicker
  useEffect(() => {
    cleaned.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [cleaned]);

  // Autoplay
  useEffect(() => {
    if (cleaned.length <= 1) return;
    if (hover) return;
    if (reducedMotionRef.current) return;

    stop();
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % cleaned.length);
    }, Math.max(2000, interval));
    return stop;
  }, [cleaned.length, interval, hover]);

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const go = (n: number) =>
    setIdx(((n % cleaned.length) + cleaned.length) % cleaned.length);
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  const hasSlides = cleaned.length > 0;

  return (
    <section
      className={`relative w-full ${heightClass} overflow-visible`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Background layer */}
      {hasSlides ? (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Crossfade slides */}
          <div className="absolute inset-0">
            {cleaned.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt=""
                className={[
                  "absolute inset-0 w-full h-full object-cover",
                  "transition-opacity duration-700 ease-in-out",
                  i === idx ? "opacity-100" : "opacity-0",
                ].join(" ")}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>

          {/* Readability overlays (kept from old) */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/25" />
        </div>
      ) : (
        // Fallback background if no images
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-700 to-slate-900" />
      )}

      {/* Foreground content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Controls */}
      {hasSlides && cleaned.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white p-2 shadow"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white p-2 shadow"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {cleaned.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  i === idx ? "bg-white w-6" : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
