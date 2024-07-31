let index = 256;
const hex = [] as string[];
let buffer!: number[];

while (index--) {
  hex[index] = (index + 256).toString(16).slice(1);
}

/**
 * A utility function that returns a [UUID (Universally Unique Identifier)](https://www.cockroachlabs.com/blog/what-is-a-uuid/) string.
 *
 * @remarks
 * This function generates a random UUID (Universally Unique Identifier) using a cryptographically secure pseudo-random number generator.
 *
 * This implementation was based on https://github.com/lukeed/uuid.
 *
 * @example
 * ```typescript
 * // Generate a UUID string
 * const id = uuid();
 * // => "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * ```
 *
 * @returns A UUID unique identifier.
 */
export function uuid() {
  let i = 0;
  let num!: number;
  let out = "";

  if (!buffer || index + 16 > 256) {
    buffer = Array.from({ length: (i = 256) });
    while (i--) buffer[i] = Math.trunc(256 * Math.random());
    i = index = 0;
  }

  for (; i < 16; i++) {
    num = buffer[index + i]!;
    if (i == 6) out += hex[(num & 15) | 64];
    else if (i == 8) out += hex[(num & 63) | 128];
    else out += hex[num];

    if (i & 1 && i > 1 && i < 11) out += "-";
  }

  index++;
  return out;
}
