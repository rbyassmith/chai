import Link from "next/link";

/** Simple text-only wordmark — no image assets. */
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-baseline gap-0.5 font-serif text-2xl tracking-tight text-clay-600"
    >
      <span className="font-medium">Chai</span>
      <span className="text-clay-400 text-lg leading-none">·</span>
    </Link>
  );
}
