const alphabet = Array.from({ length: 26 }, (_x, i) =>
  String.fromCodePoint(i + 97)
);

/**
 * Generate a random integer
 *
 * @param maximum - The maximum value (inclusive)
 * @param minimum - The minimum value (inclusive)
 * @returns A random integer
 */
export const randomInteger = (maximum: number, minimum = 0) =>
  Math.floor(Math.random() * (maximum - minimum + 1) + minimum);

/**
 * Generate a random letter
 *
 * @param random - The random number generator
 * @returns A random letter
 */
export const randomLetter = (random: () => number = Math.random) =>
  alphabet[Math.floor(random() * alphabet.length)];
