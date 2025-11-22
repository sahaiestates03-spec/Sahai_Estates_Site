// src/components/PropertyGallery.tsx
import React, { useState } from "react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const validImages = (images || []).filter(Boolean);
  const safeImages = validImages.length ? validImages : ["/fallbacks/project-hero.jpg"];

  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((curr) => (curr === 0 ? safeImages.length - 1 : curr - 1));
  };

  const next = () => {
    setIndex((curr) => (curr === safeImages.length - 1 ? 0 : curr + 1));
  };

  const goTo = (i: number) => setIndex(i);

  return (
    <div className="w-full">
      {/* MAIN IMAGE + ARROWS */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={safeImages[index]}
          alt={title}
          className="w-full h-[420px] object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/fallbacks/project-hero.jpg";
          }}
        />

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur p-2 shadow hover:bg-white"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur p-2 shadow hover:bg-white"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative flex-shrink-0 h-20 w-28 rounded-lg overflow-hidden border ${
                i === index ? "border-black" : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={src}
                alt={`${title} image ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/fallbacks/project-thumb.jpg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
