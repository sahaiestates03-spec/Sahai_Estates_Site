import { Link } from 'react-router-dom';
import { priceFormat } from "../utils/price"; //

type AnyProp = Record<string, any>;

interface PropertyCardProps {
  property: AnyProp;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  if (!property) return null;

  // ---- Safe field mapping (aliases + fallbacks) ----
  const id =
    property.id ?? property.slug ?? property._id ?? null;

  const title =
    property.title ?? property.name ?? 'Property';

  const location =
    property.location ?? property.area ?? property.address ?? 'South Mumbai';

  const segment =
    property.segment ? String(property.segment).toLowerCase() : undefined; // residential/commercial

  const statusRaw =
    (property.status ?? property.for ?? property.listingType ?? property.saleType) as
      | 'resale'
      | 'rent'
      | 'under-construction'
      | string
      | undefined;

  const status = statusRaw ? String(statusRaw).toLowerCase() : undefined;

  const bhk =
    property.bhk ?? property.bedrooms ?? undefined;

  const baths =
    property.bathrooms ?? property.baths ?? undefined;

  const areaSqft =
    property.areaSqft ?? property.sizeSqft ?? property.builtUp ?? undefined;

  const cover: string =
    property.images?.[0] ?? property.cover ?? property.image ?? '/placeholder.jpg';

  // price can be number or string
  const priceNum =
    typeof property.price === 'number'
      ? property.price
      : Number(String(property.price || '').replace(/[^0-9]/g, '') || NaN);

  // ---- Helpers ----
  const formatPriceCr = (n: number) => `₹${(n / 1e7).toFixed(2)} Cr`;
  const formatINR = (n: number) => n.toLocaleString('en-IN');

  const priceLabel = Number.isFinite(priceNum)
    ? priceNum >= 1e7
      ? formatPriceCr(priceNum)
      : `₹ ${formatINR(priceNum)}`
    : property.price || 'Price on request';

  const isFeatured = Boolean(property.isFeatured ?? property.featured);

  const prettyStatus =
    status === 'resale' ? 'Buy'
    : status === 'rent' ? 'Rent'
    : status === 'under-construction' ? 'Under Construction'
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
        />

        {/* Price */}
        <div className="text-lg font-semibold text-navy-900">
          {priceFormat(property.price, property.listingFor)}
        </div>

        {/* Featured */}
        {isFeatured && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}

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

        {/* Details row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-4">
          {bhk ? <span>🛏 {bhk} Beds</span> : null}
          {baths ? <span>🛁 {baths} Baths</span> : null}
          {areaSqft ? <span>📐 {areaSqft} sq ft</span> : null}
        </div>

        {/* Link */}
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
