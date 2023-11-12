/**
 * Generate a random UUID
 *
 * @remarks
 * This helper function is a wrapper around the `crypto.randomUUID` function. You can find more information about this type of identifier in this {@link https://en.wikipedia.org/wiki/Universally_unique_identifier article}
 *
 * @example
 * ```typescript
 *
 * // Generate a random UUID
 * const id = uuid();
 * ```
 *
 * @returns A random UUID string
 */
export function uuid(): string {
  return crypto.randomUUID();
}
