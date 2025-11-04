import { useEffect, useState, useRef } from "react";

type RotatingHeroProps = {
  images?: string[];
  interval?: number;            // ms, default 6000
  heightClass?: string;         // tailwind classes for height
  children?: React.ReactNode;
};

const TRANSITION_MS = 700; // keep this in sync with CSS transition

export default function RotatingHero({
  images = [],
  interval = 6000,
  heightClass = "min-h-[680px]",
  children,
}: RotatingHeroProps) {
  const count = images.length;

  // Only create loop if we actually have more than one slide
  const loopImages = count > 1 ? [...images, images[0]] : images;

  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const jumpTimeoutRef = useRef<number | null>(null);

  // Preload images to avoid flicker
  useEffect(() => {
    images.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // Autoplay
  useEffect(() => {
    // don’t run the loop unless there are at least 2 slides
    if (count <= 1) return;

    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, Math.max(2000, interval)); // clamp for safety

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [count, interval]);

  // Handle seamless loop (jump from cloned last back to real first)
  useEffect(() => {
    if (count <= 1) return;

    if (index === count) {
      // Wait for the visible transition to finish, then jump without animation
      if (jumpTimeoutRef.current) {
        clearTimeout(jumpTimeoutRef.current);
        jumpTimeoutRef.current = null;
      }
      jumpTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false); // disable transition for the jump
        setIndex(0);

        // Re-enable transition on the next paint (double RAF is safest)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsAnimating(true));
        });
      }, TRANSITION_MS);
    }

    return () => {
      if (jumpTimeoutRef.current) {
        clearTimeout(jumpTimeoutRef.current);
        jumpTimeoutRef.current = null;
      }
    };
  }, [index, count]);

  const slideStyle: React.CSSProperties = {
    transform: `translateX(-${index * 100}%)`,
    transition: isAnimating ? `transform ${TRANSITION_MS}ms ease` : "none",
  };

  return (
    <div className={`relative overflow-hidden ${heightClass}`}>
      {/* SLIDER */}
      <div className="w-full h-full">
        <div className="flex w-full h-full" style={slideStyle}>
          {loopImages.map((img, i) => (
            <img
              key={`${img || "blank"}-${i}`}
              src={img}
              alt=""
              className="min-w-full h-full object-cover flex-none"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
}
