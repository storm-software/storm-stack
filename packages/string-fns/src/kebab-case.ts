import { EMPTY_STRING } from "@storm-stack/utilities";
import { upperCaseFirst } from "./upper-case-first";

/**
 * Convert the input string to kebab case.
 *
 * @remarks
 * "this-is-an-example"
 *
 * @param input - The input string.
 * @returns The kebab-cased string.
 */
export const kebabCase = (input?: string): string | undefined => {
  const parts =
    input
      ?.replace(
        /([A-Z])+/g,
        (input?: string) => upperCaseFirst(input) ?? EMPTY_STRING
      )
      ?.split(/(?=[A-Z])|[\.\-\s_]/)
      .map(x => x.toLowerCase()) ?? [];
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];

  return parts.reduce((ret: string, part: string) => {
    return `${ret}-${part.toLowerCase()}`.toLowerCase();
  });
};
