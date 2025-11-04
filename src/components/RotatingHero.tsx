import { useEffect, useState, useRef } from "react";

export default function RotatingHero({
  images = [],
  interval = 6000,
  heightClass = "min-h-[680px]",
  children,
}) {
  // 🧠 create infinite loop array = [1,2,3,4,1]
  const loopImages = [...images, images[0]];

  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  useEffect(() => {
    // When we reach artificial last slide (clone), jump back to original first slide
    if (index === images.length) {
      setTimeout(() => {
        setIsAnimating(false);
        setIndex(0);
      }, 600);
    } else {
      setIsAnimating(true);
    }
  }, [index, images.length]);

  const slideStyle = {
    transform: `translateX(-${index * 100}%)`,
    transition: isAnimating ? "transform 0.7s ease" : "none",
  };

  return (
    <div className={`relative overflow-hidden ${heightClass}`}>
      {/* SLIDER */}
      <div
        ref={sliderRef}
        className="w-full h-full flex"
        style={slideStyle}
      >
        {loopImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
}
