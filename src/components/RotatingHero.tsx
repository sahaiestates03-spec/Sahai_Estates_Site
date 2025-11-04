import { useEffect, useMemo, useRef, useState } from "react";

type RotatingHeroProps = {
  images: string[];              // image urls
  interval?: number;             // autoplay duration per slide (ms) - default 6000
  speed?: number;                // slide animation speed (ms) - default 700
  heightClass?: string;          // tailwind height classes
  pauseOnHover?: boolean;        // default true
  showArrows?: boolean;          // default true
  showDots?: boolean;            // default true
  darkOverlay?: boolean;         // default true
  children?: React.ReactNode;    // centered content - your <Hero />
};

export default function RotatingHero({
  images,
  interval = 6000,
  speed = 700,
  heightClass = "min-h-[680px]",
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
  darkOverlay = true,
  children,
}: RotatingHeroProps) {
  // clean list (avoid empty strings)
  const slides = useMemo(() => (images || []).filter(Boolean), [images]);

  // loop array: [1,2,3,4,1] for seamless forward motion
  const loopSlides = useMemo(
    () => (slides.length > 1 ? [...slides, slides[0]] : slides),
    [slides]
  );

  const [index, setIndex] = useState(0);           // 0..slides.length (last is clone)
  const [isAnimating, setIsAnimating] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  // preload
  useEffect(() => {
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [slides]);

  // autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    if (pauseOnHover && isHover) return;
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, Math.max(1500, interval));
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, interval, isHover, pauseOnHover]);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // seamless reset when we hit the cloned last slide
  useEffect(() => {
    if (slides.length <= 1) return;
    if (index === slides.length) {
      // after the animated move to the clone, jump back to real first without animation
      const t = setTimeout(() => {
        setIsAnimating(false);
        setIndex(0);
      }, speed);
      return () => clearTimeout(t);
    } else {
      // re-enable animation for normal moves
      setIsAnimating(true);
    }
  }, [index, slides.length, speed]);

  const go = (i: number) => {
    if (!slides.length) return;
    // allow clicking last dot to go to first
    const safe = Math.max(0, Math.min(i, slides.length));
    setIndex(safe);
  };

  const next = () => setIndex((i) => i + 1);
  const prev = () => {
    if (index === 0) {
      // jump instantly to fake last (real last index in visual flow)
      setIsAnimating(false);
      setIndex(slides.length - 1);
      // then animate one step to real last
      setTimeout(() => {
        setIsAnimating(true);
        setIndex(slides.length); // move to clone (which looks like next)
      }, 20);
    } else {
      setIndex((i) => i - 1);
    }
  };

  // swipe support
  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40; // px
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    setTouchStartX(null);
  };

  // hybrid slide + fade overlay
  const translateStyle = {
    transform: `translateX(-${index * 100}%)`,
    transition: isAnimating ? `transform ${speed}ms ease` : "none",
  };

  // compute fade progress (0..1) based on CSS transition; we approximate with index changes
  // simpler: add a fading white overlay during movement
  const showFade = isAnimating;

  return (
    <div
      className={`relative overflow-hidden ${heightClass}`}
      onMouseEnter={() => pauseOnHover && setIsHover(true)}
      onMouseLeave={() => pauseOnHover && setIsHover(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slider track */}
      <div className="w-full h-full flex" style={translateStyle}>
        {loopSlides.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt=""
            className="w-full h-full object-cover flex-shrink-0 select-none pointer-events-none"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>

      {/* subtle dark overlay for readability */}
      {darkOverlay && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}

      {/* hybrid fade overlay while sliding */}
      {showFade && (
        <div className="absolute inset-0 bg-black/0 pointer-events-none animate-[fadeSlide_0.7s_ease]" />
      )}

      {/* Content (with entrance animation every change) */}
      <div
        key={index === slides.length ? 0 : index} // restart animation on change
        className="absolute inset-0 z-10 flex items-center justify-center
                   [animation:contentIn_600ms_ease]"
      >
        {children}
      </div>

      {/* Controls */}
      {showArrows && slides.length > 1 && (
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
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => {
            const active = (index === i) || (index === slides.length && i === 0);
            return (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  active ? "bg-white w-6" : "bg-white/60 hover:bg-white w-2.5"
                }`}
                style={{ outline: "none" }}
              />
            );
          })}
        </div>
      )}

      {/* keyframe utilities (scoped via arbitrary variants) */}
      <style>{`
        @keyframes contentIn {
          0%   { opacity: 0; transform: translateY(10px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0)     scale(1); }
        }
        @keyframes fadeSlide {
          0%   { background: rgba(0,0,0,0.10); }
          100% { background: rgba(0,0,0,0.00); }
        }
      `}</style>
    </div>
  );
}
