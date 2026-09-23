/**
 * Substitute `{name}` placeholders in a dictionary string.
 *
 * A handful of strings on this site carry a number — the gallery's count line
 * is the one — and those can't be built by concatenation in the component,
 * because the order of the words differs between languages (and Arabic reads
 * the other way). Keeping the numbers as placeholders inside the translated
 * string puts the whole sentence under the translator's control.
 *
 * An unfilled placeholder is left as-is rather than blanked: it is a visible
 * bug in the dictionary, and hiding it would keep it invisible.
 */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
