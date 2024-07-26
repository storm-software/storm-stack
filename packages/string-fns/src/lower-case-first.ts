/**
 * Lower case the first character of an input string.
 *
 * @remarks
 * "tHISISANEXAMPLE"
 *
 * @param input - The input string.
 * @returns The lower-cased string.
 */
export const lowerCaseFirst = (input?: string): string | undefined => {
  return input ? input.charAt(0).toLowerCase() + input.substring(1) : input;
};
