import type { LocaleCode } from "../locales";
import type { Dictionary } from "../types";
import { deepMerge } from "./merge";
import { en } from "./en";
import { fr } from "./fr";
import { ru } from "./ru";
import { tr } from "./tr";
import { incomplete } from "./incomplete";

/**
 * Every locale the switcher offers.
 *
 * Two kinds of entry, and the difference matters:
 *
 *   • `en`, `fr`, `ru` and `tr` are complete `Dictionary` objects, each in its
 *     own file. Switching to one of them changes every string on the page;
 *   • the rest are patches over `en` in `incomplete.ts`, so the keys they
 *     don't carry still read in English.
 *
 * It used to be patches all the way down, which made the gap invisible: a
 * locale could look finished in the switcher while the menu, the articles and
 * the reviews stayed English. Making the complete ones whole files means the
 * question "is this language actually translated?" has an answer you can read
 * off the directory.
 */
export const dictionaries: Record<LocaleCode, Dictionary> = {
  en,
  fr,
  tr,
  ru,
  de: deepMerge(en, incomplete.de ?? {}),
  es: deepMerge(en, incomplete.es ?? {}),
  it: deepMerge(en, incomplete.it ?? {}),
  ar: deepMerge(en, incomplete.ar ?? {}),
  el: deepMerge(en, incomplete.el ?? {}),
  zh: deepMerge(en, incomplete.zh ?? {}),
  pt: deepMerge(en, incomplete.pt ?? {}),
  pl: deepMerge(en, incomplete.pl ?? {}),
  uk: deepMerge(en, incomplete.uk ?? {}),
  nl: deepMerge(en, incomplete.nl ?? {}),
  ja: deepMerge(en, incomplete.ja ?? {}),
};
