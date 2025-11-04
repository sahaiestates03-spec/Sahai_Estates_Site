import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: string[];
  interval?: number;          // ms per slide
  heightClass?: string;       // tailwind height classes
  children?: React.ReactNode; // overlay content (your <Hero />)
};

export default function RotatingHero({
  images,
  interval = 6000,
  heightClass = "min-h-[720px] md:min-h-[620px] lg:min-h-[680px]",
  children,
}: Props) {
  const slides = useMemo(() => (images || []).filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  // Preload
  useEffect(() => {
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [slides]);

  // Autoplay (always forward: 0 → 1 → 2 → … → 0)
  useEffect(() => {
    if (slides.length <= 1) return;
    stop();
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, Math.max(2000, interval));
    return stop;
  }, [slides.length, interval]);

  function stop() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  if (!slides.length) {
    return (
      <div className={`relative ${heightClass} bg-black/20`}>
        <div className="relative z-10 h-full">{children}</div>
      </div>
    );
  }

  return (
      <div className={`relative w-full ${heightClass} overflow-hidden -mt-16 md:-mt-20`}>
      {/* Crossfade stack (no sliding track → no grey gaps) */}
      <div className="absolute inset-0">
        {slides.map((src, i) => {
          const active = i === idx;
          return (
            <div
              key={src + i}
              className={[
                "absolute inset-0",
                // Ken Burns + crossfade
                "transition-opacity duration-700 ease-in-out",
                active ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover will-change-transform"
                // Subtle Ken Burns zoom on the active slide (via inline animation)
                style={{
                  animation: active ? "kenburns 10s ease-in-out forwards" : "none",
                }}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          );
        })}

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Your content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === idx ? "bg-white w-6" : "bg-white/60 hover:bg-white w-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.03); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
