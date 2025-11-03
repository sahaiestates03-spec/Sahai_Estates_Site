// src/utils/normalize.ts
export const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const isMatch = (hay?: string, needle?: string) =>
  !needle || norm(hay).includes(norm(needle));

/** Expand images that use the "folder shorthand" like "residential/Beaumonde-903A/*"
 * and also ensure local images have "/prop-pics/" prefix */
export function expandImages(images?: string[]): string[] {
  if (!images || !images.length) return [];
  const out: string[] = [];

  images.forEach((raw) => {
    const x = (raw || "").trim();
    if (!x) return;

    // folder shorthand -> assume 1..12.jpg exist (stop when images actually missing is fine; browser will just 404 silently)
    if (x.endsWith("/*")) {
      const base = x.slice(0, -2).replace(/^\/+|\/+$/g, "");
      for (let i = 1; i <= 12; i++) out.push(`/prop-pics/${base}/${i}.jpg`);
      return;
    }

    // explicit file names
    if (x.startsWith("http") || x.startsWith("/")) out.push(x);
    else out.push(`/prop-pics/${x}`);
  });

  // de-dup
  return Array.from(new Set(out));
}
