import { EMPTY_STRING } from "../types";
import { upperCaseFirst } from "./upper-case-first";

/**
 * Convert the input string to snake case.
 *
 *  @remarks
 * "this_is_an_example"
 *
 * @param input - The input string.
 * @param options - Options to control the behavior of the function.
 * @returns The snake-cased string.
 */
export const snakeCase = (
  input?: string,
  options: { splitOnNumber: boolean } = { splitOnNumber: true }
) => {
  if (!input) return "";

  const parts =
    input
      ?.replace(/([A-Z])+/g, (input?: string) => upperCaseFirst(input) ?? EMPTY_STRING)
      .split(/(?=[A-Z])|[\.\-\s_]/)
      .map((x: string) => x.toLowerCase()) ?? [];
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const result = parts.reduce((ret: string, part: string) => {
    return `${ret}_${part.toLowerCase()}`;
  });
  return options?.splitOnNumber === false
    ? result
    : result.replace(/([A-Za-z]{1}[0-9]{1})/, (val: string) => `${val[0]}_${val[1]}`);
};
