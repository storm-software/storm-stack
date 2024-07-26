import { isObject } from "@storm-stack/types";

const WebCrypto: any =
  globalThis.crypto && isObject(typeof globalThis.crypto)
    ? globalThis.crypto
    : undefined;

export const Crypto = WebCrypto;

/**
 * Get the WebCrypto object
 *
 * @remarks
 * This helper function is used to get the WebCrypto object. If the object is not available, an error will be thrown.
 *
 * @returns The WebCrypto object
 */
export const getWebCrypto = () => {
  if (!WebCrypto) {
    throw new Error("Crypto is not available");
  }

  return WebCrypto;
};
