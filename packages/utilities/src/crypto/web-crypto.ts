// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// See utils.ts for details.
// The file will throw on node.js 14 and earlier.
import * as NodeCrypto from "node:crypto";

export const Crypto: NodeCrypto.webcrypto.Crypto | undefined =
  NodeCrypto && typeof NodeCrypto === "object" && "webcrypto" in NodeCrypto
    ? (NodeCrypto.webcrypto as any)
    : globalThis.crypto
    ? globalThis.crypto
    : undefined;

/**
 * Get the WebCrypto object
 *
 * @remarks
 * This helper function is used to get the WebCrypto object. If the object is not available, an error will be thrown.
 *
 * @returns The WebCrypto object
 */
export const getWebCrypto = () => {
  if (!Crypto) {
    throw new Error("Crypto is not available");
  }

  return Crypto;
};
