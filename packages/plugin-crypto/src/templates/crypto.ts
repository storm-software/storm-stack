/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { Context } from "@storm-stack/core/types/context";

export function CryptoModule(_context: Context): string {
  return `
/**
 * The Storm Stack error module provides a custom error class and utility functions to support error handling
 *
 * @module storm:crypto
 */

${getFileHeader()}

import { StormError } from "storm:error";
import {
  decodeBase64,
  decodeHex,
  encodeBase64,
  encodeHexUpperCase
} from "@oslojs/encoding";
import { serialize } from "@deepkit/type";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The length of the initialization vector
// See https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
const IV_LENGTH = 24;

export const ALGORITHMS = {
	'SHA-256': 'sha256-',
	'SHA-384': 'sha384-',
	'SHA-512': 'sha512-',
} as const;

type Algorithms = typeof ALGORITHMS;

/**
 * Generate a random string
 *
 * @param array - The array to fill with random values
 * @returns The array filled with random values
 */
export function getRandom(array: Uint8Array) {
  if (array === null) {
    throw new StormError({ type: "general", code: 9 });
  }

  // Fill the array with random values
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256); // Random byte (0-255)
  }

  return array;
}

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(size?: number | undefined): string;

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param prefix - The prefix to use for the unique identifier
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(prefix?: string, size?: number | undefined): string;

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param param - The parameter to use for the unique identifier, can be a string or number
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(param?: string | number | undefined, size?: number | undefined): string {
  if (typeof param === "number") {
    size = param;
  } else if (!param || !size) {
    size = 21; // Default size if not provided
  }

  // Use our custom getRandom function to fill a Uint8Array with random values.
  const randomBytes = getRandom(new Uint8Array(typeof param === "string" ? size - (param.length + 1) : size));

  let result = "";
  if (typeof param === "string") {
    // If the parameter is a string, use it as a prefix.
    result = param + "_";
  }

  return result + randomBytes.reduce((id, byte) => {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unnecessary because
    // the bitmask trims bytes down to the alphabet size.
    byte &= 63;
    if (byte < 36) {
      // \`0-9a-z\`
      id += byte.toString(36);
    } else if (byte < 62) {
      // \`A-Z\`
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += "-";
    } else {
      id += "_";
    }
    return id;
  }, "");
}

/**
 * Creates a CryptoKey object that can be used to encrypt any string.
 *
 * @remarks
 * This function generates a new key using the AES-GCM algorithm with a length of 256 bits.
 *
 * @returns A promise that resolves to a CryptoKey object.
 */
export async function createKey(): Promise<CryptoKey> {
	const key = await crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);
	return key;
}

/**
 * Encodes a CryptoKey to base64 string, so that it can be embedded in JSON / JavaScript
 *
 * @param key - The CryptoKey to encode
 * @returns A base64 encoded string representation of the CryptoKey
 */
export async function encodeKey(key: CryptoKey) {
	return encodeBase64(new Uint8Array(await crypto.subtle.exportKey("raw", key)));
}

/**
 * Decodes a base64 string into bytes and then imports the key.
 *
 * @param encoded - The base64 encoded string representation of the CryptoKey
 * @returns A promise that resolves to a CryptoKey object.
 */
export async function decodeKey(encoded: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
    "raw",
    decodeBase64(encoded),
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Using a CryptoKey, encrypt a string into a base64 string.
 *
 * @remarks
 * The IV is prepended to the encrypted data, so that it can be used for decryption. The IV is 12 bytes long, so the resulting string will be 24 characters
 *
 * @param key - The CryptoKey to use for encryption
 * @param raw - The string to encrypt
 * @returns A base64 encoded string containing the IV and the encrypted data
 */
export async function encrypt(key: CryptoKey, raw: string) {
	const buffer = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2)),
		},
		key,
		encoder.encode(raw),
	);

	// iv is 12, hex brings it to 24
	return encodeHexUpperCase(iv) + encodeBase64(new Uint8Array(buffer));
}

/**
 * Takes a base64 encoded string, decodes it and returns the decrypted text.
 *
 * @remarks
 * The IV is extracted from the first 24 characters of the string, and the rest is decrypted using the provided CryptoKey.
 *
 * @param key - The CryptoKey to use for decryption
 * @param encoded - The base64 encoded string containing the IV and the encrypted data
 * @returns The decrypted string
 */
export async function decrypt(key: CryptoKey, encoded: string) {
	return decoder.decode(
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: decodeHex(encoded.slice(0, IV_LENGTH)),
      },
      key,
      decodeBase64(encoded.slice(IV_LENGTH)),
	  )
  );
}

/**
 * Generates an SHA-256 digest of the given string.
 *
 * @param data - The string to hash.
 * @param algorithm - The algorithm to use.
 * @returns A promise that resolves to a base64 encoded string containing the hash.
 */
export async function generateCspDigest(data: string, algorithm: CspAlgorithm): Promise<CspHash> {
	const hashBuffer = await crypto.subtle.digest(
    algorithm,
    encoder.encode(data)
  );

	return \`\${ALGORITHMS[algorithm]}\${encodeBase64(new Uint8Array(hashBuffer))}\`;
}

   `;
}
