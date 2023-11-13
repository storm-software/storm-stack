import { isObject } from "@storm-software/utilities/type-checks/is-object";

const WebCrypto: Crypto | undefined =
  globalThis.crypto && isObject(typeof globalThis.crypto)
    ? globalThis.crypto
    : undefined;

export const Crypto = WebCrypto;
