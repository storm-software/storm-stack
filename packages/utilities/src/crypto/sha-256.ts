import { EMPTY_STRING } from "@storm-stack/types";
import { getWebCrypto } from "./web-crypto";

/**
 * Generate a SHA-256 hash
 *
 * @remarks
 * This helper function is used to generate a SHA-256 hash from a string value.
 *
 * @param value - The value to hash
 * @returns A SHA-256 hash string
 */
export const sha256 = (value: string) => {
  const crypto = getWebCrypto();
  crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(value))
    .then((h: any) => {
      const hexes: string[] = [];
      const view = new DataView(h);
      for (let i = 0; i < view.byteLength; i += 4)
        hexes.push(`00000000${view.getUint32(i).toString(16)}`.slice(-8));
      return hexes.join(EMPTY_STRING);
    });
};
