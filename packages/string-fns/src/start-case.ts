import { getWords } from "./get-words";

/**
 * Converts the first character of each word in a string to uppercase and the remaining characters to lowercase.
 *
 *  @remarks
 * "This Is An Example"
 *
 * @example
 * const result1 = startCase('hello world');  // result will be 'Hello World'
 * const result2 = startCase('HELLO WORLD');  // result will be 'Hello World'
 * const result3 = startCase('hello-world');  // result will be 'Hello World'
 * const result4 = startCase('hello_world');  // result will be 'Hello World'
 *
 * Start case is the naming convention in which each word is written with an initial capital letter.
 * @param str - The string to convert.
 * @returns The converted string.
 */
export function startCase(str: string): string {
  const words = getWords(str.trim());

  let result = "";
  for (const word of words) {
    if (word && word[0]) {
      if (result) {
        result += " ";
      }
      result +=
        word === word.toUpperCase()
          ? word
          : word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
  }

  return result;
}
