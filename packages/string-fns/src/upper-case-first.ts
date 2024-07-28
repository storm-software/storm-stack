/**
 * Upper case the first character of an input string.
 *
 *  @remarks
 * "Thisisanexample"
 *
 * @param input - The input string.
 * @returns The capitalized string.
 */
export const upperCaseFirst = (input?: string): string | undefined => {
  return input ? input.charAt(0).toUpperCase() + input.slice(1) : input;
};
