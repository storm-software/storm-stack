import { upperCaseFirst } from "./upper-case-first";

/**
 * Convert the input string to title case.
 *
 *  @remarks
 * "This Is An Example"
 *
 * @param input - The input string.
 * @returns The title cased string.
 */
export const titleCase = (input?: string): string | undefined => {
  if (!input) {
    return "";
  }

  return input
    .split(/(?=[A-Z])|[\.\-\s_]/)
    .map(s => s.trim())
    .filter(s => !!s)
    .map(s => upperCaseFirst(s.toLowerCase()))
    .join(" ");
};
