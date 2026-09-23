export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/**
 * Overlay a locale's strings on the English dictionary.
 *
 * A locale does not have to be complete to be usable: anything it leaves out
 * reads in English rather than rendering as a blank. That is the right default
 * — an untranslated label is a gap, an empty one is a bug — but it is also why
 * a half-translated locale is easy to ship without noticing, so the locales
 * that *are* complete are complete objects rather than patches over `en`.
 */
export function deepMerge<T extends Record<string, unknown>>(base: T, patch: DeepPartial<T>): T {
  const out = { ...base } as T;
  for (const key of Object.keys(patch) as Array<keyof T>) {
    const value = patch[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(
        (base[key] as Record<string, unknown>) ?? {},
        value as Record<string, unknown>,
      ) as T[keyof T];
    } else if (value !== undefined) {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}
