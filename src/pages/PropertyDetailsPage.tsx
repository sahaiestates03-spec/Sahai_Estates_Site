// src/pages/PropertyDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchSheet, type PropertyRow } from "../data/sheet";
import BrochureLeadBox from "../components/BrochureLeadBox";
import { fetchNewLaunch } from "../data/newLaunch";

import {
  MapPin, Bed, Bath, Square, Phone, MessageCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";

/* ---------- helpers ---------- */
const sluggify = (s?: string | null) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const same = (a?: string | null, b?: string | null) =>
  (a || "").toLowerCase() === (b || "").toLowerCase();

function inr(n: number) { return n.toLocaleString("en-IN"); }

function priceLabel(price?: number, listingFor?: "resale"|"rent"|"under-construction") {
  if (!price || price <= 0) return listingFor === "rent" ? "₹ — / month" : "Price on request";
  if (listingFor === "rent") {
    if (price >= 100000) {
      const lvalue = price / 100000;
      const decimals = lvalue >= 10 ? 1 : 2;
      return String(lvalue.toFixed(decimals)) + " L / month";
    }
    return "₹" + inr(price) + " / month";
  }
  if (price >= 10000000) return "₹" + String((price / 10000000).toFixed(2)) + " Cr";
  if (price >= 100000) return "₹" + String((price / 100000).toFixed(2)) + " L";
  return "₹" + inr(price);
}

/** Build image candidates */
function buildImageCandidates(p: PropertyRow): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    const s = String(u).trim();
    if (!s) return;
    const final = (s.indexOf("http") === 0 || s.indexOf("/") === 0) ? s : "/prop-pics/" + s.replace(/^\/+/, "");
    if (out.indexOf(final) === -1) out.push(final);
  };

  const raw: any = (p as any).images || (p as any).gallery_image_urls || (p as any).gallery || (p as any).hero_image_url;
  const seg = (p as any).segment ? String((p as any).segment).toLowerCase() : "";
  const slug = (p as any).slug ? String((p as any).slug).toLowerCase() : sluggify((p as any).id || (p as any).title);
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
      let folder = text.replace(/^FOLDER::/i, "").replace(/\/?\*$/,"").replace(/^\/+/, "");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (/(.+\/.+)(\*|$)/.test(text) && !/\.[a-z0-9]+$/i.test(text)) {
      let folder = text.replace(/\/?\*$/,"").replace(/^\/+/,"");
      folder = folder.replace(/^prop-pics\//i, "");
      const useNewLaunchPrefix = !/new-launch/i.test(folder);
      for (let i = 1; i <= 20; i++) {
        ["jpg","jpeg","png","webp"].forEach(ext => {
          const candidate = useNewLaunchPrefix
            ? "/prop-pics/new-launch/" + folder + "/" + i + "." + ext
            : "/prop-pics/" + folder + "/" + i + "." + ext;
          push(candidate);
        });
      }
    } else if (separators.test(text)) {
      text.split(separators).map(s => s.trim()).forEach((x) => push(x));
    } else if (text) {
      push(text);
    }
  }

  folderGuesses.forEach((folder) => {
    for (let i = 1; i <= 20; i++) {
      ["jpg","jpeg","png","webp"].forEach(ext => push("/prop-pics/" + folder + "/" + i + "." + ext));
    }
  });

  folderGuesses.forEach((folder) => {
    ["jpg","jpeg","png","webp"].forEach(ext => push("/prop-pics/" + folder + "." + ext));
  });

  return out;
}

/** Preload images */
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
// DEBUG LOGS - remove after debugging
useEffect(() => {
  console.log("PropertyDetailsPage: propFromState:", !!propFromState);
  console.log("PropertyDetailsPage: propFromSheet found:", !!propFromSheet);
  console.log("PropertyDetailsPage: final property object:", property);
  console.log("PropertyDetailsPage: rows length:", rows.length);
  if (rows.length) console.log("First row keys:", Object.keys(rows[0]).slice(0,50));
}, [propFromState, propFromSheet, property, rows]);

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!propFromState);

  // ------------------ FIXED fetch logic ------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // 1) fetch existing sheet data (may return array or {result,data})
        let sheetResp: any = null;
        try {
          sheetResp = await fetchSheet();
        } catch (err) {
          console.error("fetchSheet error:", err);
          sheetResp = null;
        }

        let sheetArray: any[] = [];
        if (Array.isArray(sheetResp)) {
          sheetArray = sheetResp;
        } else if (sheetResp && Array.isArray(sheetResp.data)) {
          sheetArray = sheetResp.data;
        } else if (sheetResp && Array.isArray(sheetResp.rows)) {
          sheetArray = sheetResp.rows;
        } else {
          sheetArray = [];
        }

        // 2) fetch new launch data (may return array or {result,data})
        let nlResp: any = null;
        try {
          nlResp = await fetchNewLaunch();
        } catch (err) {
          console.error("fetchNewLaunch error:", err);
          nlResp = null;
        }

        let nlArray: any[] = [];
        if (Array.isArray(nlResp)) {
          nlArray = nlResp;
        } else if (nlResp && Array.isArray(nlResp.data)) {
          nlArray = nlResp.data;
        } else if (nlResp && Array.isArray(nlResp.rows)) {
          nlArray = nlResp.rows;
        } else {
          nlArray = [];
        }

        // 3) map newLaunch rows into PropertyRow shape (same mapping you used)
        const mapped: PropertyRow[] = nlArray.map((p: any) => {
          const slugValue = (p.slug || sluggify(p.project_name || p.project_id || "")).toString().trim().toLowerCase();

          let carpetArea = undefined;
          if (p.carpet_min_sqft || p.carpet_max_sqft) {
            const min = p.carpet_min_sqft ? String(p.carpet_min_sqft).trim() : "";
            const max = p.carpet_max_sqft ? String(p.carpet_max_sqft).trim() : "";
            if (min && max) {
              carpetArea = min + " - " + max + " sqft";
            } else if (min) {
              carpetArea = min + "+ sqft";
            } else if (max) {
              carpetArea = "Up to " + max + " sqft";
            }
          }

          return {
            id: p.project_id || slugValue,
            slug: slugValue,
            title: p.project_name || p.title || slugValue,
            project_name: p.project_name || undefined,
            developer_name: p.developer_name || undefined,
            location: (p.locality || "") + (p.locality ? ", " : "") + (p.city || ""),
            address: p.address || undefined,
            pincode: p.pincode || undefined,
            city: p.city || undefined,
            locality: p.locality || undefined,
            price: p.price_min_inr ? Number(p.price_min_inr) : p.price ? Number(p.price) : 0,
            price_min_inr: p.price_min_inr ? Number(p.price_min_inr) : undefined,
            price_max_inr: p.price_max_inr ? Number(p.price_max_inr) : undefined,
            all_inclusive_price: p.all_inclusive_price || undefined,
            price_note: p.price_note || undefined,
            listingFor: "under-construction" as const,
            for: "under-construction",
            segment: (p.segment || "residential").toString().toLowerCase(),
            status: p.status || undefined,
            // images: p.gallery_image_urls || p.gallery || "FOLDER::" + slugValue + "/*",
images:
  p.gallery_image_urls ||
  p.gallery ||
  p.images ||
  p.image ||
  p.image_urls ||
  p.gallery_images ||
  p.gallery_urls ||
  p.galleryImages ||
  (p.project_images ? p.project_images : undefined) ||
  "FOLDER::" + slugValue + "/*",

// description: p.description || ( (p.developer_name || "") + " new launch in " + (p.locality || p.city || "Mumbai") + "." ),
description:
  p.description ||
  p.meta_description ||
  p.project_description ||
  p.summary ||
  ( (p.developer_name || "") + " new launch in " + (p.locality || p.city || "Mumbai") + "." ),

            brochure_url: p.brochure_url || "",
            youtube_video_url: p.youtube_video_url || undefined,
            virtual_tour_url: p.virtual_tour_url || undefined,
            floor_plan_urls: p.floor_plan_urls || undefined,
            site_plan_url: p.site_plan_url || undefined,
            price_list_url: p.price_list_url || undefined,
            rera_id: p.rera_id || undefined,
            rera_url: p.rera_url || undefined,
            launch_date: p.launch_date || undefined,
            possession_quarter: p.possession_quarter || undefined,
            possession_year: p.possession_year || undefined,
            construction_stage: p.construction_stage || undefined,
            unit_types: p.unit_types || undefined,
            beds_options: p.beds_options || undefined,
            carpet_min_sqft: p.carpet_min_sqft || undefined,
            carpet_max_sqft: p.carpet_max_sqft || undefined,
            total_acres: p.total_acres || undefined,
            num_towers: p.num_towers || undefined,
            floors_per_tower: p.floors_per_tower || undefined,
            elevation_style: p.elevation_style || undefined,
            architect: p.architect || undefined,
            contractor: p.contractor || undefined,
            amenities_primary: p.amenities_primary || undefined,
            amenities_sports: p.amenities_sports || undefined,
            amenities_safety: p.amenities_safety || undefined,
            amenities_green: p.amenities_green || undefined,
            parking_type: p.parking_type || undefined,
            parking_ratio: p.parking_ratio || undefined,
            water_supply: p.water_supply || undefined,
            power_backup: p.power_backup || undefined,
            fire_safety: p.fire_safety || undefined,
            hero_image_url: p.hero_image_url || undefined,
            gallery_image_urls: p.gallery_image_urls || undefined,
            sales_person_name: p.sales_person_name || undefined,
            sales_phone: p.sales_phone || undefined,
            sales_email: p.sales_email || undefined,
            meta_title: p.meta_title || undefined,
            meta_description: p.meta_description || undefined,
            canonical_url: p.canonical_url || undefined,
            featured: p.featured || undefined,
            priority_rank: p.priority_rank || undefined,
            notes: p.notes || undefined,
            bedrooms: p.beds_option || p.bedrooms || undefined,
            propertyType: p.unit_types || undefined,
            areaSqft: carpetArea || undefined,
          } as PropertyRow;
        });

        // 4) map sheetArray rows into PropertyRow if sheetArray actually holds property objects already
        const normalizedSheetRows: PropertyRow[] = sheetArray.map((p: any) => {
          if (p && (p.slug || p.project_id || p.project_name || p.title)) {
            const slugValue = (p.slug || sluggify(p.project_name || p.project_id || "")).toString().trim().toLowerCase();
            return {
              id: p.project_id || slugValue,
              slug: slugValue,
              title: p.project_name || p.title || slugValue,
              project_name: p.project_name || undefined,
              developer_name: p.developer_name || undefined,
              location: (p.locality || "") + (p.locality ? ", " : "") + (p.city || ""),
              address: p.address || undefined,
              pincode: p.pincode || undefined,
              city: p.city || undefined,
              locality: p.locality || undefined,
              price: p.price_min_inr ? Number(p.price_min_inr) : p.price ? Number(p.price) : 0,
              price_min_inr: p.price_min_inr ? Number(p.price_min_inr) : undefined,
              price_max_inr: p.price_max_inr ? Number(p.price_max_inr) : undefined,
              all_inclusive_price: p.all_inclusive_price || undefined,
              price_note: p.price_note || undefined,
              listingFor: p.listingFor || "under-construction",
              for: p.for || "under-construction",
              segment: (p.segment || "residential").toString().toLowerCase(),
              status: p.status || undefined,
              // images: p.gallery_image_urls || p.gallery || "FOLDER::" + slugValue + "/*",
images:
  p.gallery_image_urls ||
  p.gallery ||
  p.images ||
  p.image ||
  p.image_urls ||
  p.gallery_images ||
  p.gallery_urls ||
  p.galleryImages ||
  (p.project_images ? p.project_images : undefined) ||
  "FOLDER::" + slugValue + "/*",

// description: p.description || ( (p.developer_name || "") + " new launch in " + (p.locality || p.city || "Mumbai") + "." ),
description:
  p.description ||
  p.meta_description ||
  p.project_description ||
  p.summary ||
  ( (p.developer_name || "") + " new launch in " + (p.locality || p.city || "Mumbai") + "." ),
brochure_url: p.brochure_url || "",
              youtube_video_url: p.youtube_video_url || undefined,
              virtual_tour_url: p.virtual_tour_url || undefined,
              floor_plan_urls: p.floor_plan_urls || undefined,
              site_plan_url: p.site_plan_url || undefined,
              price_list_url: p.price_list_url || undefined,
              rera_id: p.rera_id || undefined,
              rera_url: p.rera_url || undefined,
              launch_date: p.launch_date || undefined,
              possession_quarter: p.possession_quarter || undefined,
              possession_year: p.possession_year || undefined,
              construction_stage: p.construction_stage || undefined,
              unit_types: p.unit_types || undefined,
              beds_options: p.beds_options || undefined,
              carpet_min_sqft: p.carpet_min_sqft || undefined,
              carpet_max_sqft: p.carpet_max_sqft || undefined,
              total_acres: p.total_acres || undefined,
              num_towers: p.num_towers || undefined,
              floors_per_tower: p.floors_per_tower || undefined,
              elevation_style: p.elevation_style || undefined,
              architect: p.architect || undefined,
              contractor: p.contractor || undefined,
              amenities_primary: p.amenities_primary || undefined,
              amenities_sports: p.amenities_sports || undefined,
              amenities_safety: p.amenities_safety || undefined,
              amenities_green: p.amenities_green || undefined,
              parking_type: p.parking_type || undefined,
              parking_ratio: p.parking_ratio || undefined,
              water_supply: p.water_supply || undefined,
              power_backup: p.power_backup || undefined,
              fire_safety: p.fire_safety || undefined,
              hero_image_url: p.hero_image_url || undefined,
              gallery_image_urls: p.gallery_image_urls || undefined,
              sales_person_name: p.sales_person_name || undefined,
              sales_phone: p.sales_phone || undefined,
              sales_email: p.sales_email || undefined,
              meta_title: p.meta_title || undefined,
              meta_description: p.meta_description || undefined,
              canonical_url: p.canonical_url || undefined,
              featured: p.featured || undefined,
              priority_rank: p.priority_rank || undefined,
              notes: p.notes || undefined,
              bedrooms: p.beds_option || p.bedrooms || undefined,
              propertyType: p.unit_types || undefined,
              areaSqft: (p.carpet_min_sqft || p.carpet_max_sqft) ? ((p.carpet_min_sqft||"") + " - " + (p.carpet_max_sqft||"") + " sqft") : undefined,
            } as PropertyRow;
          }
          return {} as PropertyRow;
        });

        // 5) final rows: sheet rows first (if any) then mapped new-launch rows.
        const finalRows = [...normalizedSheetRows.filter(r => r && (r.slug || r.id)), ...mapped];
        if (alive) setRows(finalRows);
      } catch (err) {
        console.error("Error in property fetch flow:", err);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);
  // ------------------ END fixed fetch logic ------------------

  const propFromSheet = useMemo(() => {
    if (!rows.length || !key) return null;
    return (
      rows.find(r => same(sluggify(r.slug as any), key) || same(r.slug as any, key)) ||
      rows.find(r => same(sluggify(r.id as any), key) || same(String(r.id || ""), slug)) ||
      rows.find(r => same(sluggify(r.title as any), key)) ||
      null
    );
  }, [rows, key, slug]);

  const property = propFromState || propFromSheet || null;

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
    return () => { alive = false; };
  }, [property]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) {
      setIndex(0);
      return;
    }
    if (index >= images.length) setIndex(0);
  }, [images, index]);

  const prev = () => setIndex(i => (images.length ? (i - 1 + images.length) % images.length : 0));
  const next = () => setIndex(i => (images.length ? (i + 1) % images.length : 0));
  const goto = (i: number) => setIndex(i);

  // UPDATED: use 9920214015 as requested
  const waNumber = "919920214015"; // +91 9920214015
  const salesPhoneFallback = "9920214015";

  const waText = property ? "Hi, I'm interested in " + (property.title || property.project_name) + " (" + priceLabel(property.price as any, property.listingFor) + "). Please share details." : "";
  const waLink = property ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(waText) : "https://wa.me/" + waNumber;
  const telLink = "tel:+91" + ((property as any)?.sales_phone || (property as any)?.phone || salesPhoneFallback);

  // small helpers to compose overview values
  const getProp = (p: any, ...keys: string[]) => {
    if (!p) return undefined;
    for (const k of keys) {
      if (p[k] !== undefined && p[k] !== null && String(p[k]).trim() !== "") return p[k];
      const found = Object.keys(p).find(kk => kk.toLowerCase() === k.toLowerCase());
      if (found && p[found] !== undefined && p[found] !== null && String(p[found]).trim() !== "") return p[found];
    }
    return undefined;
  };

  // decide if this is new-launch / under-construction (show dev/architect/contractor only then)
  const isNewLaunch =
    Boolean(property && property.listingFor && String(property.listingFor).toLowerCase().includes("under")) ||
    Boolean(getProp(property, "new_launch", "is_new_launch")) ||
    Boolean(property && (property as any).for && String((property as any).for).toLowerCase().includes("under"));

  // flexible getters for overview fields
  const metaTitle = String(getProp(property, "meta_title", "metaTitle", "title") ?? "").trim();
  const metaDescription = String(getProp(property, "meta_description", "metaDescription", "description") ?? property?.description ?? "").trim();
  const developerName = String(getProp(property, "developer_name", "developer", "builder", "developerName") ?? "—");

  // build address line from the best fields available
  const addrParts = [
    getProp(property, "address", "site_address", "location", "locality", "area", "areaLocality"),
    getProp(property, "city", "town"),
    getProp(property, "pincode", "pin", "postal_code")
  ].filter(Boolean).map(x => String(x).trim());
  const addressLine = addrParts.length ? addrParts.join(" • ") : "—";

  const reraId = String(getProp(property, "rera_id", "rera", "reraId") ?? "—");
  const reraUrl = String(getProp(property, "rera_url", "reraUrl", "rera link") ?? "");
  const launchDate = String(getProp(property, "launch_date", "launchDate", "launch") ?? "—");
  const possessionYear = String(getProp(property, "possession_year", "possessionYear", "possession") ?? "—");
  const constructionStage = String(getProp(property, "construction_stage", "constructionStage") ?? "—");

  const unitTypes = String(getProp(property, "unit_types", "unit types", "unitTypes") ?? "—");
  const bedsOptions = String(getProp(property, "beds_options", "beds_options", "bedrooms", "beds", "bhk") ?? "—");

  // carpet / area: try many fields
  const carpetMin = getProp(property, "carpet_min_sqft", "carpet_min", "carpetmin");
  const carpetMax = getProp(property, "carpet_max_sqft", "carpet_max", "carpetmax");
  const areaFallback = getProp(property, "areaSqft", "area", "sizeSqft", "area");
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

  const totalAcres = String(getProp(property, "total_acres", "totalAcres") ?? "—");
  const numTowers = String(getProp(property, "num_towers", "numTowers", "towers") ?? "—");
  const floorsPerTower = String(getProp(property, "floors_per_tower", "floorsPerTower", "floors_per_tower") ?? "—");
  const elevationStyle = String(getProp(property, "elevation_style", "elevationStyle", "elevation") ?? "—");
  const architect = String(getProp(property, "architect", "architectName") ?? "—");
  const contractor = String(getProp(property, "contractor", "main_contractor") ?? "—");

  const combineAmenities = (p: any) => {
    const fields = [
      p?.amenities_primary, p?.amenities_sports, p?.amenities_safety, p?.amenities_green,
      p?.parking_type, p?.parking_ratio, p?.water_supply, p?.power_backup, p?.fire_safety
    ];
    const list: string[] = [];
    fields.forEach((f) => {
      if (!f) return;
      String(f).split(/[,;]+/).map(x => x.trim()).forEach(x => { if (x) list.push(x); });
    });
    return Array.from(new Set(list)).join(", ");
  };
  const amenities = combineAmenities(property) || "—";

  const youtubeUrl = String(getProp(property, "youtube_video_url", "youtube", "youtube_url") ?? "");
  const virtualTour = String(getProp(property, "virtual_tour_url", "virtualTour", "virtual_tour") ?? "");

  if (!property && loading) {
    return <div className="pt-40 text-center text-gray-500">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/properties" className="hover:underline">Properties</Link> /{" "}
          <span>Not found</span>
        </nav>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link to="/properties" className="inline-block mt-6 px-5 py-3 bg-black text-white rounded-lg">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">

        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/properties" className="hover:underline">Properties</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{property.title || property.project_name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">{property.title || property.project_name}</h1>
            <div className="mt-2 flex items-center gap-3">
              {property.location ? (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={16} /> <span>{property.location}</span>
                </p>
              ) : null}
              {isNewLaunch ? (
                <div className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-white text-sm text-gray-700 shadow-sm border">
                  <span className="font-medium">{developerName}</span>
                </div>
              ) : null}
              {property.listingFor ? (
                <div className="inline-flex items-center px-3 py-1 rounded bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-sm font-medium shadow">
                  {(property.listingFor || "").toString().replace("-", " ")}
                </div>
              ) : null}
            </div>
          </div>

          {/* Top CTAs */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white font-semibold shadow">
              <span className="mr-3 text-sm">{priceLabel(property.price as any, property.listingFor)}</span>
            </div>

            <a href={waLink} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow transition">
              <MessageCircle size={18} /> <span className="font-medium">Enquire on WhatsApp</span>
            </a>

            <a
              href={telLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:brightness-95 transition"
              aria-label={"Call " + ((property as any).sales_phone || (property as any).phone || salesPhoneFallback)}
              title={"Call " + ((property as any).sales_phone || (property as any).phone || salesPhoneFallback)}
            >
              <Phone size={16} /> <span className="font-medium">Call</span>
              <span className="sr-only">{(property as any).sales_phone || (property as any).phone || salesPhoneFallback}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-white rounded-xl shadow overflow-hidden border">
              {imgLoading ? (
                <div className="h-96 flex items-center justify-center text-gray-400">Loading images…</div>
              ) : images.length ? (
                <div>
                  <div className="h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={ (property as any).hero_image_url || (images.length ? images[index] : "/prop-pics/default-hero.jpg") }
                      alt={(property.title || "Property") + " - " + (index + 1)}
                      className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Controls */}
                  <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                    <ChevronRight size={20} />
                  </button>

                  {/* thumbnails */}
                  <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-t">
                    {images.map((u, i) => (
                      <button
                        key={u + "-" + i}
                        onClick={() => goto(i)}
                        className={i === index ? "flex-shrink-0 w-28 h-20 rounded overflow-hidden border-2 border-indigo-600" : "flex-shrink-0 w-28 h-20 rounded overflow-hidden border border-gray-200"}
                      >
                        <img src={u} alt={"thumb-" + i} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">No images available</div>
              )}
            </div>

            {/* Overview (detailed) */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Overview</h2>
                  {metaTitle ? <div className="text-sm text-gray-500 mt-1">{metaTitle}</div> : null}
                </div>
                <div className="text-sm text-gray-500">{property.areaSqft || "—"}</div>
              </div>

              <p className="text-gray-700 mt-3 whitespace-pre-line leading-relaxed">
                {metaDescription || property.description || "No description available."}
              </p>

              {/* Important details grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  {isNewLaunch ? (
                    <div className="flex justify-between"><div className="text-gray-500">Developer</div><div className="font-medium">{developerName}</div></div>
                  ) : null}
                  <div className="flex justify-between"><div className="text-gray-500">Address</div><div className="font-medium">{addressLine || "—"}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">PIN / City</div><div className="font-medium">{(property as any).pincode || "—"}{(property as any).city ? (" • " + (property as any).city) : ""}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">RERA</div>
                    <div className="font-medium">
                      {reraId}
                      {reraUrl ? <a href={reraUrl} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 underline">View</a> : null}
                    </div>
                  </div>

                  <div className="flex justify-between"><div className="text-gray-500">Launch Date</div><div className="font-medium">{launchDate}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Possession</div><div className="font-medium">{possessionYear}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Construction Stage</div><div className="font-medium">{constructionStage}</div></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between"><div className="text-gray-500">Unit Types</div><div className="font-medium">{unitTypes}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Bedrooms</div><div className="font-medium">{bedsOptions}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Carpet Area</div><div className="font-medium">{carpetRange}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Total Area (acres)</div><div className="font-medium">{totalAcres}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Towers</div><div className="font-medium">{numTowers}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Floors / Tower</div><div className="font-medium">{floorsPerTower}</div></div>
                  <div className="flex justify-between"><div className="text-gray-500">Elevation</div><div className="font-medium">{elevationStyle}</div></div>
                </div>
              </div>

              {/* Architect / Contractor / Amenities */}
              {isNewLaunch ? (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <div className="text-gray-500">Architect</div>
                    <div className="font-medium mt-1">{architect}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Contractor</div>
                    <div className="font-medium mt-1">{contractor}</div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4">
                <div className="text-gray-500 text-sm">Amenities & Facilities</div>
                <div className="mt-1 text-sm font-medium">{amenities}</div>
              </div>

              {/* Media */}
              <div className="mt-5 flex flex-wrap gap-3">
                {youtubeUrl ? (
                  <a href={youtubeUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Watch Video</a>
                ) : null}
                {virtualTour ? (
                  <a href={virtualTour} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Virtual Tour</a>
                ) : null}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Bed size={18} /> <div>
                    <div className="text-xs text-gray-500">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms || property.beds_options || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath size={18} /> <div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                    <div className="font-medium">{(property as any).bathrooms || (property as any).baths || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Square size={18} /> <div>
                    <div className="text-xs text-gray-500">Area</div>
                    <div className="font-medium">{property.areaSqft || property.carpet_min_sqft || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} /> <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-medium">{property.location || property.locality || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column / Agent CTA & Brochure */}
          <aside className="space-y-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow p-5 space-y-4 border">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Contact</div>
                    <div className="font-semibold">{developerName}</div>

                    <div className="mt-3 flex gap-2">
                      <a href={waLink} target="_blank" rel="noreferrer"
                         className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:shadow transition">
                        <MessageCircle size={16} /> <span className="text-sm">Message</span>
                      </a>
                      <a href={telLink}
                         className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg shadow transition"
                         aria-label={"Call " + ((property as any).sales_phone || (property as any).phone || salesPhoneFallback)}
                         title={"Call " + ((property as any).sales_phone || (property as any).phone || salesPhoneFallback)}
                      >
                        <Phone size={16} /> <span className="text-sm">Call</span>
                        <span className="sr-only">{(property as any).sales_phone || (property as any).phone || salesPhoneFallback}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <BrochureLeadBox project={{
                    project_id: property.id as any,
                    project_name: property.title || property.project_name,
                    slug: property.slug as any,
                    brochure_url: property.brochure_url || ""
                  }} />
                </div>
              </div>

              {/* Developer & RERA card */}
              <div className="bg-white rounded-xl shadow p-5 mt-4 text-sm text-gray-700 border">
                <div className="font-semibold mb-2">Developer</div>
                <div>{developerName}</div>
                {property.possession_year ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Possession</div>
                    <div className="font-medium">{property.possession_year}</div>
                  </div>
                ) : null}

                {property.rera_id || property.rera_url ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">RERA</div>
                    <div className="font-medium">
                      {property.rera_id ? property.rera_id : ""}
                      {property.rera_url ? (
                        <a href={String(property.rera_url)} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 underline">View</a>
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
              <div className="text-sm text-gray-500">Ready to proceed?</div>
              <div className="text-lg font-semibold">{property.title || property.project_name}</div>
            </div>
            <div className="flex gap-3">
              <a href={waLink} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
              <a href={telLink} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                <Phone size={16} /> Call
              </a>
              <Link to="/properties" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
                Back to listings
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
