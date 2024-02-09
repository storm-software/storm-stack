/**
 * Convert the input string to pascal case.
 *
 *  @remarks
 * "ThisIsAnExample"
 *
 * @param input - The input string.
 * @returns The pascal-cased string.
 */
export const pascalCase = (input?: string): string | undefined => {
  return input
    ? input
        .split(" ")
        .map((i) => (i.length > 0 ? i.trim().charAt(0).toUpperCase() + i.trim().slice(1) : ""))
        .join("")
    : input;
};
