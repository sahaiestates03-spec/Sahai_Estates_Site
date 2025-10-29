// Replace cleanNum/toFloat usage with this:
function parsePrice(v?: string) {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();

  // If it says "cr" (crore)
  if (s.includes('cr')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e7) : undefined;
  }

  // If it says "lakh" / "lac"
  if (s.includes('lakh') || s.includes('lac')) {
    const n = Number((s.match(/[\d.]+/)?.[0] || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 1e5) : undefined;
  }

  // Otherwise treat as rupees with optional commas/₹
  const n = Number(s.replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
