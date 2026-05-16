import { initialsOf } from "@/lib/format";

const PALETTE = [
  "bg-clay-200 text-clay-700",
  "bg-forest-200 text-forest-700",
  "bg-cream-200 text-ink-900",
  "bg-clay-300 text-clay-700",
  "bg-forest-300 text-forest-700",
];

function pickPalette(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const initials = initialsOf(name);
  const sz =
    size === "sm"
      ? "h-8 w-8 text-sm"
      : size === "md"
        ? "h-12 w-12 text-base"
        : size === "lg"
          ? "h-16 w-16 text-lg"
          : "h-24 w-24 text-2xl";
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-serif font-medium ${sz} ${pickPalette(name)}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
