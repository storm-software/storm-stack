import { isObject } from "../type-checks/is-object";

const WebCrypto: Crypto | undefined =
  globalThis.crypto && isObject(typeof globalThis.crypto) ? globalThis.crypto : undefined;

export const Crypto = WebCrypto;

/**
 * Get the WebCrypto object
 *
 * @remarks
 * This helper function is used to get the WebCrypto object. If the object is not available, an error will be thrown.
 *
 * @returns The WebCrypto object
 */
export const getWebCrypto = async () => {
  try {
    if (!WebCrypto) {
      const crypto = await import("node:crypto");
      if (crypto) {
        return crypto;
      }

      throw new Error();
    }

    return WebCrypto;
  } catch (_) {
    throw new Error("Crypto is not available");
  }
};
