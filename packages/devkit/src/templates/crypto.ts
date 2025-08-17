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

import { serialize } from "@deepkit/type";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64_DECODE_MAP = {
	"0": 52,
	"1": 53,
	"2": 54,
	"3": 55,
	"4": 56,
	"5": 57,
	"6": 58,
	"7": 59,
	"8": 60,
	"9": 61,
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	F: 5,
	G: 6,
	H: 7,
	I: 8,
	J: 9,
	K: 10,
	L: 11,
	M: 12,
	N: 13,
	O: 14,
	P: 15,
	Q: 16,
	R: 17,
	S: 18,
	T: 19,
	U: 20,
	V: 21,
	W: 22,
	X: 23,
	Y: 24,
	Z: 25,
	a: 26,
	b: 27,
	c: 28,
	d: 29,
	e: 30,
	f: 31,
	g: 32,
	h: 33,
	i: 34,
	j: 35,
	k: 36,
	l: 37,
	m: 38,
	n: 39,
	o: 40,
	p: 41,
	q: 42,
	r: 43,
	s: 44,
	t: 45,
	u: 46,
	v: 47,
	w: 48,
	x: 49,
	y: 50,
	z: 51,
	"+": 62,
	"/": 63
};

const HEX_ALPHABET = "0123456789ABCDEF";
const HEX_DECODE_MAP: Record<string, number> = {
	"0": 0,
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	a: 10,
	A: 10,
	b: 11,
	B: 11,
	c: 12,
	C: 12,
	d: 13,
	D: 13,
	e: 14,
	E: 14,
	f: 15,
	F: 15
};

/**
 * Encodes a byte array into a base64 string.
 *
 * @param bytes - The byte array to encode.
 * @returns The encoded base64 string.
 */
export function encodeBase64(bytes: Uint8Array): string {
	let result = "";
	for (let i = 0; i < bytes.byteLength; i += 3) {
		let buffer = 0;
		let bufferBitSize = 0;
		for (let j = 0; j < 3 && i + j < bytes.byteLength; j++) {
			buffer = (buffer << 8) | bytes[i + j];
			bufferBitSize += 8;
		}

		for (let j = 0; j < 4; j++) {
			if (bufferBitSize >= 6) {
				result += BASE64_ALPHABET[(buffer >> (bufferBitSize - 6)) & 0x3f];
				bufferBitSize -= 6;
			} else if (bufferBitSize > 0) {
				result += BASE64_ALPHABET[(buffer << (6 - bufferBitSize)) & 0x3f];
				bufferBitSize = 0;
			} else {
				result += "=";
			}
		}
	}

	return result;
}

/**
 * Decodes a base64 encoded string into bytes.
 *
 * @param encoded - The base64 encoded string to decode.
 * @returns The decoded bytes as a Uint8Array.
 * @throws Will throw an error if the input is not valid base64.
 */
export function decodeBase64(encoded: string): Uint8Array {
	const result = new Uint8Array(Math.ceil(encoded.length / 4) * 3);
	let totalBytes = 0;
	for (let i = 0; i < encoded.length; i += 4) {
		let chunk = 0;
		let bitsRead = 0;
		for (let j = 0; j < 4; j++) {
			if (encoded[i + j] === "=") {
				continue;
			}

			if (j > 0 && encoded[i + j - 1] === "=") {
				throw new Error("Invalid padding");
			}
			if (!(encoded[i + j] in BASE64_DECODE_MAP)) {
				throw new Error("Invalid character");
			}
			chunk |= BASE64_DECODE_MAP[encoded[i + j]] << ((3 - j) * 6);
			bitsRead += 6;
		}
		if (bitsRead < 24) {
			let unused: number;
			if (bitsRead === 12) {
				unused = chunk & 0xffff;
			} else if (bitsRead === 18) {
				unused = chunk & 0xff;
			} else {
				throw new Error("Invalid padding");
			}
			if (unused !== 0) {
				throw new Error("Invalid padding");
			}
		}
		const byteLength = Math.floor(bitsRead / 8);
		for (let i = 0; i < byteLength; i++) {
			result[totalBytes] = (chunk >> (16 - i * 8)) & 0xff;
			totalBytes++;
		}
	}
	return result.slice(0, totalBytes);
}

/**
 * Encodes a byte array into a hex string.
 *
 * @param data - The byte array to encode.
 * @returns The encoded hex string.
 */
export function encodeHex(data: Uint8Array): string {
	let result = "";
	for (let i = 0; i < data.length; i++) {
		result += HEX_ALPHABET[data[i] >> 4];
		result += HEX_ALPHABET[data[i] & 0x0f];
	}
	return result;
}

/**
 * Decodes a hex string into bytes.
 *
 * @param data - The hex string to decode.
 * @returns The decoded bytes.
 */
export function decodeHex(data: string): Uint8Array {
	if (data.length % 2 !== 0) {
		throw new Error("Invalid hex string");
	}
	const result = new Uint8Array(data.length / 2);
	for (let i = 0; i < data.length; i += 2) {
		if (!(data[i] in HEX_DECODE_MAP)) {
			throw new Error("Invalid character");
		}
		if (!(data[i + 1] in HEX_DECODE_MAP)) {
			throw new Error("Invalid character");
		}
		result[i / 2] |= HEX_DECODE_MAP[data[i]] << 4;
		result[i / 2] |= HEX_DECODE_MAP[data[i + 1]];
	}
	return result;
}

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
 * Creates a CryptoKey object that can be used to encrypt any string.
 *
 * @remarks
 * This function generates a new key using the AES-GCM algorithm with a length of 256 bits.
 *
 * @returns A promise that resolves to a CryptoKey object.
 */
export async function generateKey(): Promise<CryptoKey> {
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

/**
 * Using a CryptoKey, encrypt a string into a base64 string.
 *
 * @remarks
 * The IV is prepended to the encrypted data, so that it can be used for decryption. The IV is 12 bytes long, so the resulting string will be 24 characters
 *
 * @param raw - The string to encrypt
 * @returns A base64 encoded string containing the IV and the encrypted data
 */
export async function encrypt(raw: string) {
	const buffer = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2)),
		},
		$storm.inject.config.ENCRYPTION_KEY,
		encoder.encode(raw),
	);

	// iv is 12, hex brings it to 24
	return encodeHex(iv) + encodeBase64(new Uint8Array(buffer));
}

/**
 * Takes a base64 encoded string, decodes it and returns the decrypted text.
 *
 * @remarks
 * The IV is extracted from the first 24 characters of the string, and the rest is decrypted using the provided CryptoKey.
 *
 * @param encoded - The base64 encoded string containing the IV and the encrypted data
 * @returns The decrypted string
 */
export async function decrypt(encoded: string) {
	return decoder.decode(
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: decodeHex(encoded.slice(0, IV_LENGTH)),
      },
      $storm.inject.config.ENCRYPTION_KEY,
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
