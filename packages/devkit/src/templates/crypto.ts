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

import { Buffer } from "node:buffer";
import type { BinaryLike, KeyObject } from "node:crypto";
import {
  createCipheriv,
  createDecipheriv,
  createSecretKey,
  pbkdf2Sync,
  randomBytes
} from "node:crypto";

// Background:
// https://security.stackexchange.com/questions/184305/why-would-i-ever-use-aes-256-cbc-if-aes-256-gcm-is-more-secure

const CIPHER_ALGORITHM = "chacha20-poly1305";
const CIPHER_KEY_LENGTH = 32; // https://stackoverflow.com/a/28307668/4397028
const CIPHER_IV_LENGTH = 16; // https://stackoverflow.com/a/28307668/4397028
const CIPHER_TAG_LENGTH = 16;
const CIPHER_SALT_LENGTH = 64;

const PBKDF2_ITERATIONS = 100_000; // https://support.1password.com/pbkdf2/

/**
 * Creates and returns a new key object containing a secret key for symmetric encryption or \`Hmac\`.
 *
 * @param key - The key to use when creating the \`KeyObject\`.
 * @returns The new \`KeyObject\`.
 */
export function createSecret(key: NodeJS.ArrayBufferView): KeyObject;

/**
 * Creates and returns a new key object containing a secret key for symmetric encryption or \`Hmac\`.
 *
 * @param key - The key to use. If \`key\` is a \`Buffer\`, \`TypedArray\`, or \`DataView\`, the \`encoding\` argument is ignored.
 * @param encoding - The \`encoding\` of the \`key\` string. Must be one of \`'utf8'\`, \`'utf16le'\`, \`'latin1'\`, or \`'base64'\`. Default is \`'utf8'\`.
 * @returns The new \`KeyObject\`.
 */
export function createSecret(key: string, encoding: BufferEncoding): KeyObject;

/**
 * Creates and returns a new key object containing a secret key for symmetric encryption or \`Hmac\`.
 *
 * @param key - The key to use. If \`key\` is a \`Buffer\`, \`TypedArray\`, or \`DataView\`, the \`encoding\` argument is ignored.
 * @param encoding - The \`encoding\` of the \`key\` string. Must be one of \`'utf8'\`, \`'utf16le'\`, \`'latin1'\`, or \`'base64'\`. Default is \`'utf8'\`.
 * @returns The new \`KeyObject\`.
 */
export function createSecret(
  key: string | NodeJS.ArrayBufferView,
  encoding?: BufferEncoding
): KeyObject {
  return typeof key === "string"
    ? createSecretKey(key, encoding!)
    : createSecretKey(key);
}

/**
 * Symmetrically encrypts data using the [ChaCha20-Poly1305](https://en.wikipedia.org/wiki/ChaCha20-Poly1305) cipher.
 *
 * @see https://en.wikipedia.org/wiki/ChaCha20-Poly1305
 *
 * @param secret - The secret key used for encryption.
 * @param plaintext - The data to encrypt.
 * @returns The encrypted data.
 */
export function encrypt(secret: BinaryLike, plaintext: string): string {
  // https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
  const key = pbkdf2Sync(
    secret,
    randomBytes(CIPHER_SALT_LENGTH),
    PBKDF2_ITERATIONS,
    CIPHER_KEY_LENGTH,
    "sha512"
  );

  const cipher = createCipheriv(CIPHER_ALGORITHM, key, randomBytes(CIPHER_IV_LENGTH));
  const encrypted = Buffer.concat([
    cipher.update(
      plaintext,
      "utf8"
    ),
    cipher.final()
  ]);

  // https://nodejs.org/api/crypto.html#crypto_cipher_getauthtag
  const tag = cipher.getAuthTag();

  return Buffer.concat([
    // Data as required by: https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options
    salt, // Salt for Key: https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
    iv, // IV: https://nodejs.org/api/crypto.html#crypto_class_decipher
    tag, // Tag: https://nodejs.org/api/crypto.html#crypto_decipher_setauthtag_buffer
    encrypted
  ]).toString("hex");
}

/**
 * Symmetrically decrypts data using the [ChaCha20-Poly1305](https://en.wikipedia.org/wiki/ChaCha20-Poly1305) cipher.
 *
 * @see https://en.wikipedia.org/wiki/ChaCha20-Poly1305
 *
 * @param secret - The secret key used for decryption.
 * @param encrypted - The encrypted data to decrypt.
 * @returns The decrypted data.
 */
export function decrypt(secret: BinaryLike, encrypted: string): string {
  const buffer = Buffer.from(encrypted, "hex");

  // https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
  const key = pbkdf2Sync(
    secret,
    buffer.slice(0, CIPHER_SALT_LENGTH),
    PBKDF2_ITERATIONS,
    CIPHER_KEY_LENGTH,
    "sha512"
  );

  const decipher = createDecipheriv(
    CIPHER_ALGORITHM,
    key,
    buffer.slice(
      CIPHER_SALT_LENGTH,
      CIPHER_SALT_LENGTH + CIPHER_IV_LENGTH
    )
  );
  decipher.setAuthTag(buffer.slice(
    CIPHER_SALT_LENGTH + CIPHER_IV_LENGTH,
    CIPHER_SALT_LENGTH + CIPHER_IV_LENGTH + CIPHER_TAG_LENGTH
  ));

  // eslint-disable-next-line ts/restrict-plus-operands
  return decipher.update(buffer.slice(
    CIPHER_SALT_LENGTH + CIPHER_IV_LENGTH + CIPHER_TAG_LENGTH
  )) + decipher.final("utf8");
}


`;
}
