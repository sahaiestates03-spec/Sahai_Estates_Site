// src/components/RotatingHero.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [images.length, interval]);

  return (
    <section className={`relative w-full ${heightClass} overflow-hidden`}>
      {/* Slider layer */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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

        {/* Soften overlays (lighter than before) */}
        <div className="absolute inset-0 bg-black/20" />  {/* was /40 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/25" /> {/* was heavier */}
      </div>

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
