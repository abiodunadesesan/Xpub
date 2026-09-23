import type { Dictionary } from "./i18n/types";

export type SocialIcon = "facebook" | "instagram" | "phone";

export type Social = {
  href: string;
  icon: SocialIcon;
};

/**
 * The venue's off-site profiles and its number.
 *
 * Only the destination lives here. The accessible name does not, because it
 * has to change language with the rest of the page — a hard-coded English
 * `label` on these records was the one string in the header and the visit
 * panel that never translated, on a site that offers fifteen locales.
 */
export const socials: Social[] = [
  { href: "https://www.facebook.com/xpubgirne", icon: "facebook" },
  { href: "https://www.instagram.com/xpubgirne/", icon: "instagram" },
  { href: "tel:+905338547040", icon: "phone" },
];

/**
 * Name a profile link for assistive tech, in the visitor's language.
 *
 * "Facebook" and "Instagram" are brand names and read the same everywhere, but
 * they still go through the dictionary so that a locale is free to write them
 * differently. The phone entry borrows `ui.call` rather than `footer.*`,
 * because `footer.*` is the column heading above these icons and reading
 * "Follow" off a dial link tells nobody what it does.
 */
export function socialLabel(icon: SocialIcon, t: Dictionary) {
  if (icon === "instagram") return t.footer.instagram;
  if (icon === "facebook") return t.footer.facebook;
  return t.ui.call;
}
