// src/utils/price.ts
export function inr(n: number) {
  return n.toLocaleString("en-IN");
}

export function priceFormat(price?: number, listingFor?: string) {
  if (!price || price <= 0) return "Price on request";

  const f = (listingFor || "").toLowerCase();

  // RENT PRICING
  if (f === "rent" || f === "lease") {
    if (price >= 1e5) {
      const lakhs = price / 1e5;
      const digits = lakhs >= 10 ? 1 : 2;
      return `${lakhs.toFixed(digits)} L / month`;
    }
    return `₹${inr(price)} / month`;
  }

  // SALE PRICING
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} L`;
  return `₹${inr(price)}`;
}
