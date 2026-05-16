export function RatingStars({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  const px = size === "sm" ? "text-xs" : "text-base";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-clay-500 ${px}`}
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : "text-ink-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
