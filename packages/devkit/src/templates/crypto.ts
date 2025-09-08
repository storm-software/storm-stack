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
 * The Storm Stack crypto module provides custom helper functions to support encrypting and decrypting data.
 *
 * @module storm:crypto
 */

${getFileHeader()}

import { serialize } from "@storm-stack/core/deepkit/type";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/ciphers/utils";
import { randomBytes } from '@noble/ciphers/utils.js';
import { managedNonce } from "@noble/ciphers/webcrypto";
import { hexToBytes } from '@noble/ciphers/utils.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function generateSecretHash = () => {
	return randomBytes(32).toString("hex");
};

/**
 * Encodes a CryptoKey to base64 string, so that it can be embedded in JSON / JavaScript
 *
 * @param key - The CryptoKey to encode, defaults to the encryption key from the config
 * @returns A base64 encoded string representation of the CryptoKey
 */
export async function encodeKey(key = $storm.config.ENCRYPTION_KEY) {
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

export async function encrypt(data: string) {
	const chacha = managedNonce(xchacha20poly1305)(
    new Uint8Array(hexToBytes($storm.config.ENCRYPTION_KEY))
  );
	return bytesToHex(chacha.encrypt(encoder.encode(data)));
};

export async function decrypt(data: string) {
  const chacha = managedNonce(xchacha20poly1305)(
    new Uint8Array(hexToBytes($storm.config.ENCRYPTION_KEY))
  );
	return decoder.decode(chacha.decrypt(hexToBytes(data)));
};


`;
}
