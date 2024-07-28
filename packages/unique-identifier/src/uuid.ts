import { hash } from "@storm-stack/hashing";
import { isSetString, isString, stringToUint8Array } from "@storm-stack/types";

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex: string[] = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x1_00).toString(16).slice(1));
}

function unsafeStringify(arr: number[], offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  //
  // Note to future-self: No, you can't remove the `toLowerCase()` call.
  // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
  return `${
    byteToHex[arr[offset + 0]!]! +
    byteToHex[arr[offset + 1]!]! +
    byteToHex[arr[offset + 2]!]! +
    byteToHex[arr[offset + 3]!]!
  }-${byteToHex[arr[offset + 4]!]!}${byteToHex[arr[offset + 5]!]!}-${byteToHex[
    arr[offset + 6]!
  ]!}${byteToHex[arr[offset + 7]!]!}-${byteToHex[arr[offset + 8]!]!}${byteToHex[
    arr[offset + 9]!
  ]!}-${byteToHex[arr[offset + 10]!]!}${byteToHex[
    arr[offset + 11]!
  ]!}${byteToHex[arr[offset + 12]!]!}${byteToHex[
    arr[offset + 13]!
  ]!}${byteToHex[arr[offset + 14]!]!}${byteToHex[
    arr[offset + 15]!
  ]!}`.toLowerCase();
}

const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

function parse(uuid: string) {
  if (
    !isSetString(uuid) ||
    /^(?:[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}|0{8}-(?:0{4}-){3}0{12})$/i.test(
      uuid
    ) === false
  ) {
    throw new TypeError("Invalid UUID");
  }

  let value!: number;
  const arr = new Uint8Array(16);

  // Parse ########-....-....-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[0] = (value = Number.parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = (value >>> 16) & 0xff;
  arr[2] = (value >>> 8) & 0xff;
  arr[3] = value & 0xff;

  // Parse ........-####-....-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[4] = (value = Number.parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = value & 0xff;

  // Parse ........-....-####-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[6] = (value = Number.parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = value & 0xff;

  // Parse ........-....-....-####-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[8] = (value = Number.parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = value & 0xff;

  // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[10] =
    ((value = Number.parseInt(uuid.slice(24, 36), 16)) / 0x1_00_00_00_00_00) &
    0xff;
  arr[11] = (value / 0x1_00_00_00_00) & 0xff;
  arr[12] = (value >>> 24) & 0xff;
  arr[13] = (value >>> 16) & 0xff;
  arr[14] = (value >>> 8) & 0xff;
  arr[15] = value & 0xff;

  return arr;
}

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
function uuid5(name: string, version: number) {
  function generateUUID(
    value: string | any[] | ArrayLike<number> = "",
    namespace: string | any[] | ArrayLike<number> = "storm",
    buf?: { [x: string]: number | undefined },
    offset = 0
  ): string {
    if (isString(value)) {
      value = stringToUint8Array(value);
    }

    if (isString(namespace)) {
      namespace = parse(namespace);
    }
    if (namespace?.length !== 16) {
      throw new TypeError(
        "Namespace must be array-like (16 iterable integer values, 0-255)"
      );
    }

    // Compute hash of _namespace and _value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashFn([..._namespace, ... _value])`
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = stringToUint8Array(hash(bytes));

    if (bytes[6]) {
      bytes[6] = (bytes[6] & 0x0f) | version;
    }
    if (bytes[8]) {
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
    }

    // if (buf) {
    //   offset = offset || 0;

    //   for (let i = 0; i < 16; ++i) {
    //     buf[offset + i] = bytes[i];
    //   }

    //   return buf as string;
    // }

    return unsafeStringify([...bytes]);
  }

  // Function#name is not settable on some platforms (#270)
  try {
    generateUUID.name = name;
    // eslint-disable-next-line no-empty
  } catch {}

  // For CommonJS default export support
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;

  return generateUUID;
}

export const uuid = uuid5("v5", 0x50);
