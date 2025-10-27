import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  images: string[];          // e.g. ["/images/hero1.jpg", ...]
  interval?: number;         // ms between slides (default 6000)
  heightClass?: string;      // tailwind height for hero (default md:h-[560px])
  children: ReactNode;       // your existing heading + buttons + search bar
};

export default function RotatingHero({
  images,
  interval = 6000,
  heightClass = "h-[520px] md:h-[560px] lg:h-[620px]",
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
      {/* SLIDER LAYER (behind) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="flex h-full w-[100%] transition-transform duration-700 ease-out"
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

        {/* Soft dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Optional top-to-bottom gradient for extra polish */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
      </div>

      {/* CONTENT LAYER (on top) */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
