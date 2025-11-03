// src/components/PropertyCard.tsx
import { Link } from "react-router-dom";
import { priceFormat } from "../utils/price";

type AnyProp = Record<string, any>;

interface PropertyCardProps {
  property: AnyProp;
}

/** Decide a safe cover image from images/cover/image + folder shorthand */
function expandCover(prop: AnyProp): string {
  const raw = prop?.images;

  // 1) Array of images -> first item
  if (Array.isArray(raw) && raw.length) {
    const first = String(raw[0]);
    return (first.startsWith("http") || first.startsWith("/"))
      ? first
      : `/prop-pics/${first.replace(/^\/+/, "")}`;
  }

  // 2) Single string in "images" (or use "cover"/"image")
  let s: string | undefined =
    (typeof raw === "string" && raw.trim()) ||
    (typeof prop?.cover === "string" && prop.cover.trim()) ||
    (typeof prop?.image === "string" && prop.image.trim());

  if (!s) return "/placeholder.jpg";

  // Folder shorthand: "FOLDER::segment/slug/*" or "segment/slug/*" or "segment/slug"
  if (s.startsWith("FOLDER::")) {
    const folder = s.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"");
    return `/prop-pics/${folder}/1.jpg`;
  }
  // Looks like folder (has slash, no extension) OR ends with /*
  const looksLikeFolder = (t: string) =>
    /.+\/.+/.test(t) && !/\.[a-z0-9]+$/i.test(t);
  if (s.endsWith("/*")) s = s.slice(0, -2);
  if (looksLikeFolder(s)) return `/prop-pics/${s.replace(/^\/+/, "")}/1.jpg`;

  // Explicit path or URL
  return (s.startsWith("http") || s.startsWith("/")) ? s : `/prop-pics/${s}`;
}

/** Make a reliable slug for routing */
function makeSlug(prop: AnyProp): string | null {
  const s = prop?.slug;
  if (typeof s === "string" && s.trim()) {
    return s.trim().toLowerCase();
  }
  const fromTitle = prop?.title ?? prop?.name;
  if (typeof fromTitle === "string" && fromTitle.trim()) {
    return fromTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  return null;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  if (!property) return null;

  const slug = makeSlug(property); // ✅ always prefer slug for route

  const title: string =
    property.title ?? property.name ?? "Property";

  const location: string =
    property.location ?? property.area ?? property.address ?? "South Mumbai";

  const segment: string | undefined =
    property.segment ? String(property.segment).toLowerCase() : undefined;

  const listingForRaw =
    property.listingFor ??
    property.status ??
    property.for ??
    property.listingType ??
    property.saleType;

  const listingFor: string | undefined =
    listingForRaw ? String(listingForRaw).toLowerCase() : undefined;

  const bhk: number | undefined = property.bhk ?? property.bedrooms ?? undefined;
  const baths: number | undefined = property.bathrooms ?? property.baths ?? undefined;
  const areaSqft: number | undefined = property.areaSqft ?? property.sizeSqft ?? property.builtUp ?? undefined;

  const cover = expandCover(property);

  const priceNum: number | undefined =
    typeof property.price === "number"
      ? property.price
      : ((): number | undefined => {
          const n = Number(String(property.price || "").replace(/[^\d]/g, ""));
          return Number.isFinite(n) && n > 0 ? n : undefined;
        })();

  const isFeatured = Boolean(property.isFeatured ?? property.featured);

  const prettyStatus =
    listingFor === "resale" ? "Buy"
    : listingFor === "rent" ? "Rent"
    : listingFor === "under-construction" ? "Under Construction"
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

        {slug ? (
          <Link to={`/properties/${encodeURIComponent(property.slug || property.id || sluggify(property.title || ""))}`}>
  View Details →
</Link>

        ) : (
          <span className="text-sm text-gray-500 italic">No details link</span>
        )}
      </div>
    </div>
  );
}
