/**
 * Pure pricing helpers — safe to import from client components.
 * (Keep this file free of server-only imports: mongoose, fs, etc.)
 */
export function formatPrice(price?: number): string {
  if (price == null) return "Custom Pricing";
  return `From $${price.toLocaleString("en-US")}`;
}
