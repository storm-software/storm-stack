// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// See utils.ts for details.
// The file will throw on node.js 14 and earlier.
import * as nodeCrypto from "node:crypto";

export const Crypto: nodeCrypto.webcrypto.Crypto | undefined =
  nodeCrypto && typeof nodeCrypto === "object" && "webcrypto" in nodeCrypto
    ? (nodeCrypto.webcrypto as any)
    : globalThis.crypto
    ? globalThis.crypto
    : undefined;

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
  if (!Crypto) {
    throw new Error("Crypto is not available to generate uuid");
  }

  return Crypto.randomUUID();
}
