// src/components/RotatingHero.tsx
import React, { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  images: string[];
  interval?: number;
  heightClass?: string;
  children: ReactNode;
};

export default function RotatingHero({
  images,
  interval = 6000,
  heightClass = "h-[560px] md:h-[620px]",
  children,
}: Props) {
  // Guard: if images not provided, just render children (no slider)
  const validImages = Array.isArray(images) && images.length > 0;
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!validImages || images.length <= 1) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [validImages, images, interval]);

  return (
    <section className={`relative w-full ${heightClass} overflow-visible`}>
      {/* Background layer */}
      {validImages ? (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <div key={i} className="h-full w-full shrink-0">
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
          {/* Light overlays for readability */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/25" />
        </div>
      ) : (
        // Fallback background (in case images missing)
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-700 to-slate-900" />
      )}

      {/* Foreground content */}
      <div className="relative z-10 h-full">{children}</div>
    </section>
  );
}
