import { socials } from "@/lib/socials";

/**
 * One place for the facts a search engine needs.
 *
 * `metadata` in `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` and the
 * JSON-LD graph all describe the same business, and a structured-data entry
 * that disagrees with the page it describes is worse than none at all. Keeping
 * the address, phone and hours here means they can only be wrong once.
 *
 * Everything below is taken from what the site itself displays — nothing here
 * is inferred. In particular there is no `geo` block, because the venue's
 * coordinates appear nowhere in this project and an invented pin is a lie a
 * crawler will happily repeat; Google geocodes the postal address instead.
 */

/**
 * Canonical origin. Set `NEXT_PUBLIC_SITE_URL` when the site moves to a
 * custom domain, so canonicals, the sitemap and `og:url` follow it.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://xpubgirne.vercel.app"
).replace(/\/+$/, "");

export const BUSINESS = {
  name: "X Pub",
  alternateName: "X Pub Girne",
  /** Matches `brand.tagline` in the dictionaries. */
  slogan: "From first pour to last call",
  description:
    "X Pub is a prestigious nightlife spot in Girne, Northern Cyprus, with VIP rooms, live DJs every night, weekly promotions, and late closing at 4 AM.",
  street: "Şht. Fehmi Ercan Sk No:13",
  locality: "Girne",
  postalCode: "9920",
  region: "Girne",
  country: "CY",
  /** Northern Cyprus dialling, as shown in the visit panel. */
  telephone: "+90 533 854 70 40",
  /** The venue closes at 4 AM and opens every day; no opening time is stated. */
  closes: "04:00",
  rating: { value: 4.4, count: 9 },
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=%C5%9Eht.+Fehmi+Ercan+Sk+No:13,+Girne+9920",
} as const;

/** Only the off-site profiles, for `sameAs` — `tel:` links aren't profiles. */
export const PROFILE_URLS = socials
  .filter((social) => social.icon !== "phone")
  .map((social) => social.href);

export const PHONE_HREF =
  socials.find((social) => social.icon === "phone")?.href ?? "tel:+905338547040";

/** Every day the venue is open, for `openingHoursSpecification`. */
export const OPEN_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
