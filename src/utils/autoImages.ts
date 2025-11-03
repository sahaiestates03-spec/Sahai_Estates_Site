// src/utils/autoImages.ts
// Discover images in /public/prop-pics/<folder>/ by trying 1..N and common extensions.
// Works on static hosting where directory listing is not allowed.

const EXTS = ["webp", "jpg", "jpeg", "png"];
const MAX = 20; // try up to 20 images per property

function testImg(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Given a folder path relative to /prop-pics (e.g. "residential/Beaumonde-903A"),
 * attempts to find numbered files 1..MAX with common extensions.
 * Returns the discovered URLs (prefixed with /prop-pics/).
 */
export async function discoverImages(folder: string, max: number = MAX): Promise<string[]> {
  const base = folder.replace(/^\/+|\/+$/g, ""); // trim slashes
  const candidates: string[] = [];

  for (let i = 1; i <= max; i++) {
    for (const ext of EXTS) {
      candidates.push(`/prop-pics/${base}/${i}.${ext}`);
    }
  }

  const results = await Promise.all(candidates.map(testImg));
  // Keep only the first existing file per index
  const picked: Record<number, string> = {};
  results.forEach((ok) => {
    if (!ok) return;
    const m = ok.match(/\/(\d+)\.(\w+)$/);
    const idx = m ? Number(m[1]) : 0;
    if (idx && !picked[idx]) picked[idx] = ok;
  });

  return Object.keys(picked)
    .map((k) => Number(k))
    .sort((a, b) => a - b)
    .map((k) => picked[k]);
}

/** heuristic: is this images field a folder shorthand (no extension, no http, no commas) */
export function looksLikeFolder(value?: string) {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  if (v.includes(",")) return false;         // comma-separated list => not a single folder
  if (v.startsWith("http")) return false;    // full url is not a folder
  if (/\.\w{2,5}$/.test(v)) return false;    // ends with .jpg/.png => file, not folder
  return true; // e.g. "residential/Beaumonde-903A"
}
