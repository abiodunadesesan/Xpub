import { en } from "@/lib/i18n/dictionaries/en";
import { photographUrls } from "@/lib/cdn";
import { BUSINESS, OPEN_DAYS, PROFILE_URLS, SITE_URL } from "@/lib/site";

/**
 * The schema.org graph the whole site is described by.
 *
 * It lives in its own module because it is the one piece of markup whose shape
 * is dictated by an outside authority rather than by the design, and because
 * it now reads from the same dictionaries the page renders. A crawler that
 * finds structured data contradicting the visible content discounts both, so
 * every field below is either a fact in `lib/site.ts` or a string the page
 * actually prints — the menu sections come from `en.menu.categories`, and the
 * reviews are the reviews the reviews section shows.
 *
 * Server-only by construction: importing the dictionary here would pull every
 * string in it into the client bundle if this were reachable from a client
 * component, so only `app/layout.tsx` imports it.
 */

/** `"5/5"` → `5`. Ratings are written for humans, not for parsers. */
function ratingValue(rating: string, fallback = 5) {
  const parsed = Number.parseInt(rating, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * How many photographs to publish as `image`.
 *
 * Google reads a handful; listing all forty-plus would bloat every page's
 * head with URLs the crawler will fetch from the sitemap anyway.
 */
const IMAGE_LIMIT = 12;

export function structuredData() {
  const photographList = photographUrls().slice(0, IMAGE_LIMIT);
  const menuUrl = `${SITE_URL}/#menu`;

  const menuSections = en.menu.categories
    ? en.menu.tabs.map((tab) => ({
        "@type": "MenuSection",
        name: tab.label,
        hasMenuItem: en.menu.categories[tab.id].map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.detail,
        })),
      }))
    : [];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BarOrPub",
        "@id": `${SITE_URL}/#venue`,
        name: BUSINESS.name,
        alternateName: BUSINESS.alternateName,
        slogan: BUSINESS.slogan,
        description: BUSINESS.description,
        url: SITE_URL,
        image: photographList.length > 0 ? photographList : [`${SITE_URL}/brand/og.jpg`],
        logo: `${SITE_URL}/brand/logo.webp`,
        telephone: BUSINESS.telephone,
        hasMap: BUSINESS.mapsHref,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.street,
          addressLocality: BUSINESS.locality,
          addressRegion: BUSINESS.region,
          postalCode: BUSINESS.postalCode,
          addressCountry: BUSINESS.country,
        },
        sameAs: PROFILE_URLS,
        // The menu is a real node on this page rather than a keyword, so the
        // drinks the venue pours are machine-readable and not just prose.
        hasMenu: { "@id": menuUrl },
        // No `opens` value: the site states a 4 AM close but never an opening
        // time, and guessing one would be published as fact.
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [...OPEN_DAYS],
          closes: BUSINESS.closes,
        },
        // Both of these are printed on the page: the review cards in the
        // reviews section, and "Dogs allowed" in the visit panel.
        review: en.reviews.items.map((item) => ({
          "@type": "Review",
          author: { "@type": "Person", name: item.name },
          reviewRating: {
            "@type": "Rating",
            ratingValue: ratingValue(item.rating),
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody: item.text,
        })),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: BUSINESS.rating.value,
          reviewCount: BUSINESS.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
        amenityFeature: [
          {
            "@type": "LocationFeatureSpecification",
            name: en.visit.dogs,
            value: true,
          },
        ],
      },
      {
        "@type": "Menu",
        "@id": menuUrl,
        name: `${BUSINESS.name} — ${en.menu.titleTop} ${en.menu.titleBottom}`.trim(),
        description: en.menu.note,
        inLanguage: "en",
        hasMenuSection: menuSections,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BUSINESS.alternateName,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#venue` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: BUSINESS.alternateName,
        description: BUSINESS.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#venue` },
        ...(photographList[0] ? { primaryImageOfPage: photographList[0] } : {}),
      },
    ],
  };
}
