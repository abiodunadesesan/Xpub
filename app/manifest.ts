import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/site";

/**
 * The web app manifest.
 *
 * It is what turns "Add to Home Screen" from a bookmark into something that
 * opens full-screen with the venue's name and colour, which for a nightlife
 * site is the difference between a saved tab and an icon someone taps on the
 * way out. Next emits the `<link rel="manifest">` itself.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.alternateName} — ${BUSINESS.slogan}`,
    short_name: BUSINESS.name,
    description: BUSINESS.description,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    lang: "en",
    dir: "ltr",
    categories: ["food", "nightlife", "entertainment"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
