import type { MetadataRoute } from "next";
import { photographUrls } from "@/lib/cdn";
import { SITE_URL } from "@/lib/site";

/**
 * The site is two real pages — the one-pager and the legal notice — with every
 * section an anchor inside the first. There are no per-language URLs: the
 * language switcher swaps the dictionary in the client, so the same address
 * serves all fifteen. Claiming `hreflang` alternates here would point crawlers
 * at URLs that don't exist.
 *
 * The venue's photos are listed as image entries because they *are* the
 * content of a nightlife site, and they live on the R2 CDN rather than under
 * `/public`. `/legal` gets none: it is a text page, and padding it with the
 * venue's photographs would be listing files that page doesn't show.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const images = photographUrls();

  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      ...(images.length > 0 ? { images } : {}),
    },
    {
      url: `${SITE_URL}/legal`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
