import { snakeCase } from "./snake-case";

/**
 * Convert the input string to constant case.
 *
 * @remarks
 * "THIS_IS_AN_EXAMPLE"
 *
 * @param input - The input string.
 * @returns The constant-cased string.
 */
export const constantCase = (input?: string): string | undefined => {
  return snakeCase(input)?.toUpperCase();
};
