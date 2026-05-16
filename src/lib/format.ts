/**
 * Small formatting helpers shared between server and client components.
 */

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatKes(n: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

export function payRangeLabel(min: number, max: number): string {
  return `${formatKes(min)} – ${formatKes(max)} / mo`;
}

/** Returns a short relative date string like "2 days ago". English only is fine for the prototype. */
export function relativeDate(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diff = Math.max(0, now - date.getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} wk${w === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} mo ago`;
  const y = Math.floor(d / 365);
  return `${y} yr${y === 1 ? "" : "s"} ago`;
}
