import { lowerCaseFirst } from "./lower-case-first";
import { pascalCase } from "./pascal-case";

/**
 * Convert the input string to camel case.
 *
 * @remarks
 * "thisIsAnExample"
 *
 * @param input - The input string.
 * @returns The camel-cased string.
 */
export const camelCase = (input?: string): string | undefined => {
  return input ? lowerCaseFirst(pascalCase(input)) : input;
};
