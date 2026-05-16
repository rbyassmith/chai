import type { MetadataRoute } from "next";

/**
 * PWA manifest used by Android "Add to Home Screen" and desktop install
 * prompts. Icons are resolved automatically from icon.tsx / apple-icon.tsx
 * via Next.js metadata file conventions.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chai — Vetted household help in Nairobi",
    short_name: "Chai",
    description:
      "Trust-first marketplace connecting Nairobi households with verified domestic workers.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdfaf3", // cream-50
    theme_color: "#b04b2c", // clay-500
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
