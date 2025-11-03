// src/components/PropertyCard.tsx
import { expandImages } from "../utils/normalize";
import { Link } from 'react-router-dom';
import { priceFormat } from "../utils/price";
import { looksLikeFolder } from "../utils/autoImages";

type AnyProp = Record<string, any>;

interface PropertyCardProps {
  property: AnyProp;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  if (!property) return null;

  const id =
    property.id ?? property.slug ?? property._id ?? null;

  const title: string =
    property.title ?? property.name ?? 'Property';

  const location: string =
    property.location ?? property.area ?? property.address ?? 'South Mumbai';

  const segment: string | undefined =
    property.segment ? String(property.segment).toLowerCase() : undefined;

  const listingForRaw =
    property.listingFor ??
    property.status ??
    property.for ??
    property.listingType ??
    property.saleType;

  const listingFor: string | undefined = listingForRaw ? String(listingForRaw).toLowerCase() : undefined;

  const bhk: number | undefined = property.bhk ?? property.bedrooms ?? undefined;
  const baths: number | undefined = property.bathrooms ?? property.baths ?? undefined;
  const areaSqft: number | undefined = property.areaSqft ?? property.sizeSqft ?? property.builtUp ?? undefined;

  // cover image (folder shorthand -> /1.jpg)
  let cover: string =
    property.images?.[0] ?? property.cover ?? property.image ?? '/placeholder.jpg';

  if (typeof cover === 'string' && cover.startsWith("FOLDER::")) {
    cover = `/prop-pics/${cover.replace("FOLDER::", "")}/1.jpg`;
  } else if (typeof cover === 'string' && looksLikeFolder(cover)) {
    cover = `/prop-pics/${cover.replace(/^\/+/, "")}/1.jpg`;
  }

  const priceNum: number | undefined =
    typeof property.price === 'number'
      ? property.price
      : Number(String(property.price || '').replace(/[^\d]/g, '')) || undefined;

  const isFeatured = Boolean(property.isFeatured ?? property.featured);

  const prettyStatus =
    listingFor === 'resale' ? 'Buy'
    : listingFor === 'rent' ? 'Rent'
    : listingFor === 'under-construction' ? 'Under Construction'
    : undefined;

  const prettySegment =
    segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : undefined;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />

        {/* Featured */}
        {isFeatured && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
            Featured
          </div>
        )}

        {/* Price */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-lg font-semibold text-navy-900 shadow">
          {priceFormat(priceNum, listingFor)}
        </div>

        {/* Badges */}
        <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
          {prettyStatus && (
            <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-medium text-gray-800">
              {prettyStatus}
            </span>
          )}
          {prettySegment && (
            <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-medium text-gray-800">
              {prettySegment}
            </span>
          )}
          {bhk && (
            <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-medium text-gray-800">
              {bhk} BHK
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-600 mb-3 line-clamp-1">{location}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-4">
          {bhk ? <span>🛏 {bhk} Beds</span> : null}
          {baths ? <span>🛁 {baths} Baths</span> : null}
          {areaSqft ? <span>📐 {areaSqft} sq ft</span> : null}
        </div>

        {id ? (
          <Link
            to={`/properties/${id}`}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold"
          >
            View Details →
          </Link>
        ) : (
          <span className="text-sm text-gray-500 italic">No details link</span>
        )}
      </div>
    </div>
  );
}
