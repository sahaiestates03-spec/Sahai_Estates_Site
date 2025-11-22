// src/pages/PropertyDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import BrochureLeadBox from "../components/BrochureLeadBox";
import { fetchNewLaunch } from "../data/newLaunch";
import PropertyGallery from "../components/PropertyGallery";

import {
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  MessageCircle,
} from "lucide-react";

/* ---------- small helpers ---------- */
const sluggify = (s?: string | null) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const same = (a?: string | null, b?: string | null) =>
  (a || "").toLowerCase() === (b || "").toLowerCase();

function inr(n: number) {
  return n.toLocaleString("en-IN");
}

function priceLabel(
  price?: number | any,
  listingFor?: "resale" | "rent" | "under-construction"
) {
  const p =
    typeof price === "number"
      ? price
      : Number(String(price || "").replace(/[^\d]/g, "")) || 0;
  if (!p || p <= 0)
    return listingFor === "rent" ? "₹ — / month" : "Price on request";
  if (listingFor === "rent") {
    if (p >= 100000) {
      const lvalue = p / 100000;
      const decimals = lvalue >= 10 ? 1 : 2;
      return String(lvalue.toFixed(decimals)) + " L / month";
    }
    return "₹" + inr(p) + " / month";
  }
  if (p >= 10000000) return "₹" + String((p / 10000000).toFixed(2)) + " Cr";
  if (p >= 100000) return "₹" + String((p / 100000).toFixed(2)) + " L";
  return "₹" + inr(p);
}

/* ---------- image helpers (robust) ---------- */
function buildImageCandidates(p: PropertyRow): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    const s = String(u).trim();
    if (!s) return;
    const final =
      s.indexOf("http") === 0 || s.indexOf("/") === 0
        ? s
        : "/prop-pics/" + s.replace(/^\/+/, "");
    if (out.indexOf(final) === -1) out.push(final);
  };

  const raw: any =
    (p as any).images ||
    (p as any).gallery_image_urls ||
    (p as any).gallery ||
    (p as any).hero_image_url ||
    (p as any).galleryImages ||
    (p as any).gallery_images ||
    (p as any).image_urls ||
    (p as any).image;

  const seg = (p as any).segment
    ? String((p as any).segment).toLowerCase()
    : "";
  const slug = (p as any).slug
    ? String((p as any).slug).toLowerCase()
    : sluggify((p as any).id || (p as any).title);
  const folderGuesses: string[] = [];
  if (seg && slug) folderGuesses.push(seg + "/" + slug);
  if (slug) folderGuesses.push(slug);

  if (Array.isArray(raw)) {
    raw.forEach((r) => push(String(r || "")));
  }

  if (typeof raw === "string") {
    const text = raw.trim();
    const separators = /[,\|;]+/;
    if (text.toUpperCase().indexOf("FOLDER::") === 0) {
      let folder = text
        .replace(/^FOLDER::/i, "")
        .replace(/\/?\*$/, "")
        .replace(/^\/+/, "");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg", "jpeg", "png", "webp"].forEach((ext) => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (/(.+\/.+)(\*|$)/.test(text) && !/\.[a-z0-9]+$/i.test(text)) {
      let folder = text.replace(/\/?\*$/, "").replace(/^\/+/, "");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg", "jpeg", "png", "webp"].forEach((ext) => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (separators.test(text)) {
      text
        .split(separators)
        .map((s) => s.trim())
        .forEach((x) => push(x));
    } else if (text) {
      push(text);
    }
  }

  folderGuesses.forEach((folder) => {
    for (let i = 1; i <= 20; i++) {
      ["jpg", "jpeg", "png", "webp"].forEach((ext) =>
        push("/prop-pics/" + folder + "/" + i + "." + ext)
      );
    }
  });

  folderGuesses.forEach((folder) => {
    ["jpg", "jpeg", "png", "webp"].forEach((ext) =>
      push("/prop-pics/" + folder + "." + ext)
    );
  });

  return out;
}

async function preloadImages(urls: string[]): Promise<string[]> {
  const checks = urls.map(
    (u) =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(u);
        img.onerror = () => resolve(null);
        img.src = u;
      })
  );
  const results = await Promise.all(checks);
  return results.filter((u): u is string => Boolean(u));
}

/* ---------- component ---------- */
export default function PropertyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const key = sluggify(String(slug || ""));
  const location = useLocation() as { state?: { property?: PropertyRow } };

  const propFromState = location?.state?.property ?? null;

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!propFromState);

  // fetch sheet + newLaunch and normalize both into PropertyRow shape
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        let sheetResp: any = null;
        try {
          sheetResp = await fetchSheet();
        } catch (err) {
          console.error("fetchSheet error:", err);
          sheetResp = null;
        }
        let sheetArray: any[] = [];
        if (Array.isArray(sheetResp)) sheetArray = sheetResp;
        else if (sheetResp && Array.isArray(sheetResp.data))
          sheetArray = sheetResp.data;
        else if (sheetResp && Array.isArray(sheetResp.rows))
          sheetArray = sheetResp.rows;
        else sheetArray = [];

        let nlResp: any = null;
        try {
          nlResp = await fetchNewLaunch();
        } catch (err) {
          console.error("fetchNewLaunch error:", err);
          nlResp = null;
        }
        let nlArray: any[] = [];
        if (Array.isArray(nlResp)) nlArray = nlResp;
        else if (nlResp && Array.isArray(nlResp.data)) nlArray = nlResp.data;
        else if (nlResp && Array.isArray(nlResp.rows)) nlArray = nlResp.rows;
        else nlArray = [];

        // helper to map single raw row -> PropertyRow (used for both sheet and nl)
        const mapRow = (p: any) => {
          const slugValue = (
            p.slug ||
            sluggify(
              p.project_name || p.project_id || p.title || p.id || ""
            )
          )
            .toString()
            .trim()
            .toLowerCase();
          let carpetArea = undefined;
          if (p.carpet_min_sqft || p.carpet_max_sqft) {
            const min = p.carpet_min_sqft
              ? String(p.carpet_min_sqft).trim()
              : "";
            const max = p.carpet_max_sqft
              ? String(p.carpet_max_sqft).trim()
              : "";
            if (min && max) carpetArea = min + " - " + max + " sqft";
            else if (min) carpetArea = min + " sqft";
            else if (max) carpetArea = "Up to " + max + " sqft";
          }
          const imagesField =
            p.gallery_image_urls ||
            p.gallery ||
            p.images ||
            p.image ||
            p.image_urls ||
            p.gallery_images ||
            p.gallery_urls ||
            p.galleryImages ||
            p.project_images ||
            p.hero_image_url ||
            undefined;

          const descriptionField =
            p.description ||
            p.meta_description ||
            p.project_description ||
            p.summary ||
            p.short_description ||
            undefined;

          return {
            id: p.project_id || p.id || slugValue,
            slug: slugValue,
            title: p.project_name || p.title || slugValue,
            project_name: p.project_name || undefined,
            developer_name:
              p.developer_name || p.developer || p.builder || undefined,
            location:
              (p.locality || p.area || "") +
              (p.locality ? ", " : "") +
              (p.city || p.town || ""),
            address: p.address || p.site_address || undefined,
            pincode: p.pincode || p.pin || p.postal_code || undefined,
            city: p.city || undefined,
            locality: p.locality || undefined,
            price: p.price_min_inr
              ? Number(p.price_min_inr)
              : p.price
              ? Number(p.price)
              : 0,
            price_min_inr: p.price_min_inr
              ? Number(p.price_min_inr)
              : undefined,
            price_max_inr: p.price_max_inr
              ? Number(p.price_max_inr)
              : undefined,
            listingFor:
              p.listingFor ||
              p.for ||
              (p.for_sale ? "resale" : p.for_rent ? "rent" : undefined),
            segment: (p.segment || "residential").toString().toLowerCase(),
            status: p.status || undefined,
            description:
              descriptionField ||
              (p.developer_name || p.developer || "") +
                " new launch in " +
                (p.locality || p.city || "Mumbai") +
                ".",
            images: imagesField ? imagesField : "FOLDER::" + slugValue + "/*",
            brochure_url: p.brochure_url || p.brochure || "",
            youtube_video_url: p.youtube_video_url || p.youtube || undefined,
            virtual_tour_url:
              p.virtual_tour_url || p.virtualTour || undefined,
            rera_id: p.rera_id || p.rera || undefined,
            rera_url: p.rera_url || p.reraUrl || undefined,
            launch_date: p.launch_date || undefined,
            possession_year: p.possession_year || p.possession || undefined,
            construction_stage: p.construction_stage || undefined,
            unit_types: p.unit_types || undefined,
            beds_options:
              p.beds_options || p.bedrooms || p.beds || undefined,
            carpet_min_sqft: p.carpet_min_sqft || undefined,
            carpet_max_sqft: p.carpet_max_sqft || undefined,
            total_acres: p.total_acres || undefined,
            num_towers: p.num_towers || undefined,
            floors_per_tower: p.floors_per_tower || undefined,
            elevation_style: p.elevation_style || p.elevation || undefined,
            architect: p.architect || undefined,
            contractor: p.contractor || undefined,
            amenities_primary: p.amenities_primary || p.amenities || undefined,
            hero_image_url: p.hero_image_url || undefined,
            gallery_image_urls: p.gallery_image_urls || undefined,
            sales_person_name: p.sales_person_name || undefined,
            sales_phone:
              p.sales_phone || p.sales_phone_number || p.salesPhone || undefined,
            meta_title: p.meta_title || undefined,
            meta_description: p.meta_description || undefined,
            featured: p.featured || p.isFeatured || undefined,
            bedrooms: p.beds_option || p.bedrooms || undefined,
            propertyType: p.unit_types || undefined,
            areaSqft: carpetArea || undefined,
          } as PropertyRow;
        };

        const mappedNL = nlArray.map(mapRow);
        const mappedSheet = sheetArray.map(mapRow);

        // prefer sheet rows first, then new-launch entries
        const finalRows = [
          ...mappedSheet.filter((r) => r && (r.slug || r.id)),
          ...mappedNL.filter((r) => r && (r.slug || r.id)),
        ];
        if (alive) setRows(finalRows);
      } catch (err) {
        console.error("Error in property fetch flow:", err);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // find property from rows (sheet) using slug/id/title
  const propFromSheet = useMemo(() => {
    if (!rows.length || !key) return null;
    return (
      rows.find(
        (r) =>
          same(sluggify(r.slug as any), key) || same(r.slug as any, key)
      ) ||
      rows.find(
        (r) =>
          same(sluggify(r.id as any), key) ||
          same(String(r.id || ""), slug)
      ) ||
      rows.find((r) => same(sluggify(r.title as any), key)) ||
      null
    );
  }, [rows, key, slug]);

  // choose property: prefer sheet-based object (richer) else state
  const sheetHasEnough = (r?: any) => r && Object.keys(r).length > 3;
  const property = sheetHasEnough(propFromSheet)
    ? propFromSheet
    : propFromState || propFromSheet || null;

  // images
  const [images, setImages] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!property) {
        setImages([]);
        setImgLoading(false);
        return;
      }
      setImgLoading(true);
      const candidates = buildImageCandidates(property);
      const valid = await preloadImages(candidates);
      if (!alive) return;
      setImages(valid);
      setImgLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [property]);

  // contact links
  const waNumber = "919920214015"; // update if needed
  const salesPhoneFallback = "9920214015";
  const waText = property
    ? "Hi, I'm interested in " +
      (property.title || property.project_name) +
      " (" +
      priceLabel(property.price as any, property.listingFor) +
      "). Please share details."
    : "";
  const waLink = property
    ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(waText)
    : "https://wa.me/" + waNumber;
  const telLink =
    "tel:+91" +
    ((property as any)?.sales_phone ||
      (property as any)?.phone ||
      salesPhoneFallback);

  // small flexible getter for different header names
  const getProp = (p: any, ...keys: string[]) => {
    if (!p) return undefined;
    for (const k of keys) {
      if (
        p[k] !== undefined &&
        p[k] !== null &&
        String(p[k]).trim() !== ""
      )
        return p[k];
      const found = Object.keys(p).find(
        (kk) => kk.toLowerCase() === k.toLowerCase()
      );
      if (
        found &&
        p[found] !== undefined &&
        p[found] !== null &&
        String(p[found]).trim() !== ""
      )
        return p[found];
    }
    return undefined;
  };

  // determine if new-launch style
  const isNewLaunch =
    Boolean(
      property &&
        property.listingFor &&
        String(property.listingFor).toLowerCase().includes("under")
    ) ||
    Boolean(getProp(property, "new_launch", "is_new_launch")) ||
    Boolean(
      property &&
        (property as any).for &&
        String((property as any).for).toLowerCase().includes("under")
    );

  // flexible overview values (many fallbacks)
  const metaTitle = String(
    getProp(property, "meta_title", "metaTitle", "title") ?? ""
  ).trim();
  const metaDescription = String(
    getProp(
      property,
      "meta_description",
      "metaDescription",
      "description"
    ) ?? property?.description ?? ""
  ).trim();
  const developerName = String(
    getProp(
      property,
      "developer_name",
      "developer",
      "builder",
      "developerName"
    ) ?? "—"
  );

  const addrParts = [
    getProp(
      property,
      "address",
      "site_address",
      "location",
      "locality",
      "area",
      "areaLocality"
    ),
    getProp(property, "city", "town"),
    getProp(property, "pincode", "pin", "postal_code"),
  ]
    .filter(Boolean)
    .map((x) => String(x).trim());
  const addressLine = addrParts.length ? addrParts.join(" • ") : "—";

  const reraId = String(
    getProp(property, "rera_id", "rera", "reraId") ?? "—"
  );
  const reraUrl = String(
    getProp(property, "rera_url", "reraUrl", "rera link") ?? ""
  );
  const launchDate = String(
    getProp(property, "launch_date", "launchDate", "launch") ?? "—"
  );
  const possessionYear = String(
    getProp(
      property,
      "possession_year",
      "possessionYear",
      "possession"
    ) ?? "—"
  );
  const constructionStage = String(
    getProp(
      property,
      "construction_stage",
      "constructionStage"
    ) ?? "—"
  );
  const unitTypes = String(
    getProp(property, "unit_types", "unit types", "unitTypes") ?? "—"
  );
  const bedsOptions = String(
    getProp(
      property,
      "beds_options",
      "beds_options",
      "bedrooms",
      "beds",
      "bhk"
    ) ?? "—"
  );

  // carpet / area
  const carpetMin = getProp(
    property,
    "carpet_min_sqft",
    "carpet_min",
    "carpetmin"
  );
  const carpetMax = getProp(
    property,
    "carpet_max_sqft",
    "carpet_max",
    "carpetmax"
  );
  const areaFallback = getProp(
    property,
    "areaSqft",
    "area",
    "sizeSqft",
    "area"
  );
  let carpetRange = "—";
  if (carpetMin || carpetMax) {
    const min = carpetMin ? String(carpetMin).trim() : "";
    const max = carpetMax ? String(carpetMax).trim() : "";
    if (min && max) carpetRange = min + " - " + max + " sqft";
    else if (min) carpetRange = min + " sqft";
    else if (max) carpetRange = "Up to " + max + " sqft";
  } else if (areaFallback) {
    carpetRange = String(areaFallback).trim();
  }

  const totalAcres = String(
    getProp(property, "total_acres", "totalAcres") ?? "—"
  );
  const numTowers = String(
    getProp(property, "num_towers", "numTowers", "towers") ?? "—"
  );
  const floorsPerTower = String(
    getProp(
      property,
      "floors_per_tower",
      "floorsPerTower",
      "floors_per_tower"
    ) ?? "—"
  );
  const elevationStyle = String(
    getProp(
      property,
      "elevation_style",
      "elevationStyle",
      "elevation"
    ) ?? "—"
  );
  const architect = String(
    getProp(property, "architect", "architectName") ?? "—"
  );
  const contractor = String(
    getProp(property, "contractor", "main_contractor") ?? "—"
  );

  // combine amenities (comma separated)
  const combineAmenities = (p: any) => {
    const fields = [
      p?.amenities_primary,
      p?.amenities_sports,
      p?.amenities_safety,
      p?.amenities_green,
      p?.parking_type,
      p?.parking_ratio,
      p?.water_supply,
      p?.power_backup,
      p?.fire_safety,
    ];
    const list: string[] = [];
    fields.forEach((f) => {
      if (!f) return;
      String(f)
        .split(/[,;]+/)
        .map((x) => x.trim())
        .forEach((x) => {
          if (x) list.push(x);
        });
    });
    return Array.from(new Set(list)).join(", ");
  };
  const amenities = combineAmenities(property) || "—";

  if (!property && loading) {
    return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/properties" className="hover:underline">
            Properties
          </Link>{" "}
          / <span>Not found</span>
        </nav>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link
          to="/properties"
          className="inline-block mt-6 px-5 py-3 bg-black text-white rounded-lg"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  /* ---------- conditional row renderer (keeps UI clean) ---------- */
  function renderRow(label: string, value: any) {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    if (!s || s === "—") return null;
    return (
      <div className="flex justify-between">
        <div className="text-gray-500">{label}</div>
        <div className="font-medium">{s}</div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">
            Properties
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">
            {property.title || property.project_name}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">
              {property.title || property.project_name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              {property.location ? (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={16} /> <span>{property.location}</span>
                </p>
              ) : null}
              {isNewLaunch ? (
                <div className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg:white text-sm text-gray-700 shadow-sm border">
                  <span className="font-medium">{developerName}</span>
                </div>
              ) : null}
              {property.listingFor ? (
                <div className="inline-flex items-center px-3 py-1 rounded bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-sm font-medium shadow">
                  {(property.listingFor || "")
                    .toString()
                    .replace("-", " ")}
                </div>
              ) : null}
            </div>
          </div>

          {/* Top CTAs */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white font-semibold shadow">
              <span className="mr-3 text-sm">
                {priceLabel(property.price as any, property.listingFor)}
              </span>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow transition"
            >
              <MessageCircle size={18} />{" "}
              <span className="font-medium">Enquire on WhatsApp</span>
            </a>

            <a
              href={telLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:brightness-95 transition"
              aria-label={
                "Call " +
                ((property as any).sales_phone ||
                  (property as any).phone ||
                  salesPhoneFallback)
              }
              title={
                "Call " +
                ((property as any).sales_phone ||
                  (property as any).phone ||
                  salesPhoneFallback)
              }
            >
              <Phone size={16} /> <span className="font-medium">Call</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-white rounded-xl shadow overflow-hidden border">
              {imgLoading ? (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  Loading images…
                </div>
              ) : (
                <PropertyGallery
                  images={images}
                  title={
                    property.title ||
                    property.project_name ||
                    "Property images"
                  }
                />
              )}
            </div>

            {/* Overview (detailed) */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Overview</h2>
                  {metaTitle ? (
                    <div className="text-sm text-gray-500 mt-1">
                      {metaTitle}
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-gray-500">
                  {property.areaSqft || "—"}
                </div>
              </div>

              <p className="text-gray-700 mt-3 whitespace-pre-line leading-relaxed">
                {metaDescription ||
                  property.description ||
                  "No description available."}
              </p>

              {/* Important details (conditional rows) */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  {isNewLaunch ? renderRow("Developer", developerName) : null}
                  {renderRow("Address", addressLine)}
                  {renderRow(
                    "PIN / City",
                    (property as any).pincode
                      ? (property as any).pincode +
                          (property.city ? " • " + property.city : "")
                      : property.city
                      ? property.city
                      : undefined
                  )}
                  {renderRow(
                    "RERA",
                    reraId !== "—"
                      ? reraId + (reraUrl ? " " : "")
                      : undefined
                  )}
                  {reraUrl ? (
                    <div className="flex justify-between">
                      <div className="text-gray-500">RERA Link</div>
                      <div className="font-medium">
                        <a
                          href={reraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ) : null}
                  {renderRow("Launch Date", launchDate)}
                  {renderRow("Possession", possessionYear)}
                  {renderRow("Construction Stage", constructionStage)}
                </div>

                <div className="space-y-2">
                  {renderRow("Unit Types", unitTypes)}
                  {renderRow("Bedrooms", bedsOptions)}
                  {renderRow("Carpet Area", carpetRange)}
                  {renderRow("Total Area (acres)", totalAcres)}
                  {renderRow("Towers", numTowers)}
                  {renderRow("Floors / Tower", floorsPerTower)}
                  {renderRow("Elevation", elevationStyle)}
                </div>
              </div>

              {/* Architect/Contractor (only when present) */}
              {(architect && architect !== "—") ||
              (contractor && contractor !== "—") ? (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  {architect && architect !== "—" ? (
                    <div>
                      <div className="text-gray-500">Architect</div>
                      <div className="font-medium mt-1">{architect}</div>
                    </div>
                  ) : null}
                  {contractor && contractor !== "—" ? (
                    <div>
                      <div className="text-gray-500">Contractor</div>
                      <div className="font-medium mt-1">{contractor}</div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4">
                <div className="text-gray-500 text-sm">
                  Amenities & Facilities
                </div>
                <div className="mt-1 text-sm font-medium">{amenities}</div>
              </div>

              {/* Media */}
              <div className="mt-5 flex flex-wrap gap-3">
                {getProp(
                  property,
                  "youtube_video_url",
                  "youtube",
                  "youtube_url"
                ) ? (
                  <a
                    href={String(
                      getProp(
                        property,
                        "youtube_video_url",
                        "youtube",
                        "youtube_url"
                      )
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 border rounded"
                  >
                    Watch Video
                  </a>
                ) : null}
                {getProp(
                  property,
                  "virtual_tour_url",
                  "virtualTour",
                  "virtual_tour"
                ) ? (
                  <a
                    href={String(
                      getProp(
                        property,
                        "virtual_tour_url",
                        "virtualTour",
                        "virtual_tour"
                      )
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 border rounded"
                  >
                    Virtual Tour
                  </a>
                ) : null}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">
                Property Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Bed size={18} />{" "}
                  <div>
                    <div className="text-xs text-gray-500">Bedrooms</div>
                    <div className="font-medium">
                      {property.bedrooms ||
                        property.beds_options ||
                        "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath size={18} />{" "}
                  <div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                    <div className="font-medium">
                      {(property as any).bathrooms ||
                        (property as any).baths ||
                        "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Square size={18} />{" "}
                  <div>
                    <div className="text-xs text-gray-500">Area</div>
                    <div className="font-medium">
                      {property.areaSqft ||
                        property.carpet_min_sqft ||
                        "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} />{" "}
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-medium">
                      {property.location || property.locality || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="space-y-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow p-5 space-y-4 border">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      Contact
                    </div>
                    <div className="font-semibold">{developerName}</div>

                    <div className="mt-3 flex gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:shadow transition"
                      >
                        <MessageCircle size={16} />{" "}
                        <span className="text-sm">Message</span>
                      </a>
                      <a
                        href={telLink}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg shadow transition"
                        aria-label={
                          "Call " +
                          ((property as any).sales_phone ||
                            (property as any).phone ||
                            salesPhoneFallback)
                        }
                        title={
                          "Call " +
                          ((property as any).sales_phone ||
                            (property as any).phone ||
                            salesPhoneFallback)
                        }
                      >
                        <Phone size={16} />{" "}
                        <span className="text-sm">Call</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <BrochureLeadBox
                    project={{
                      project_id: property.id as any,
                      project_name:
                        property.title || property.project_name,
                      slug: property.slug as any,
                      brochure_url: property.brochure_url || "",
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 mt-4 text-sm text-gray-700 border">
                <div className="font-semibold mb-2">Developer</div>
                <div>{developerName}</div>
                {property.possession_year ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">
                      Possession
                    </div>
                    <div className="font-medium">
                      {property.possession_year}
                    </div>
                  </div>
                ) : null}

                {property.rera_id || property.rera_url ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">RERA</div>
                    <div className="font-medium">
                      {property.rera_id ? property.rera_id : ""}
                      {property.rera_url ? (
                        <a
                          href={String(property.rera_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-indigo-600 underline"
                        >
                          View
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer quick links */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">
                Ready to proceed?
              </div>
              <div className="text-lg font-semibold">
                {property.title || property.project_name}
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
              <a
                href={telLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
              >
                <Phone size={16} /> Call
              </a>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                Back to listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
