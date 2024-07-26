import { isSetString, isString, sha1 } from "@storm-stack/utilities";

function stringToBytes(str: string | number | boolean) {
  const _str = unescape(encodeURIComponent(str));
  const bytes = [];

  for (let i = 0; i < _str.length; ++i) {
    bytes.push(_str.charCodeAt(i));
  }

  return bytes;
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex: string[] = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr: number[], offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  //
  // Note to future-self: No, you can't remove the `toLowerCase()` call.
  // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
  return (
    `${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 0]!]! +
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 1]!]! +
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 2]!]! +
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 3]!]!
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
    }-${byteToHex[arr[offset + 4]!]!}${byteToHex[arr[offset + 5]!]!}-${byteToHex[
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      arr[offset + 6]!
    ]!}${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 7]!]!
    }-${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 8]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 9]!]!
    }-${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 10]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 11]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 12]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 13]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 14]!]!
    }${
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      byteToHex[arr[offset + 15]!]!
    }`.toLowerCase()
  );
}

const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

function parse(uuid: string) {
  if (
    !isSetString(uuid) ||
    /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i.test(
      uuid
    ) === false
  ) {
    throw TypeError("Invalid UUID");
  }

  let value!: number;
  const arr = new Uint8Array(16);

  // Parse ########-....-....-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[0] = (value = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = (value >>> 16) & 0xff;
  arr[2] = (value >>> 8) & 0xff;
  arr[3] = value & 0xff;

  // Parse ........-####-....-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[4] = (value = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = value & 0xff;

  // Parse ........-....-####-....-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[6] = (value = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = value & 0xff;

  // Parse ........-....-....-####-............
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[8] = (value = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = value & 0xff;

  // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  arr[10] = ((value = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff;
  arr[11] = (value / 0x100000000) & 0xff;
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
function uuid5(
  name: string,
  version: number,
  hashFn: (bytes: string | number | boolean | Uint8Array | any[]) => Uint8Array
) {
  function generateUUID(
    value: string | any[] | ArrayLike<number>,
    namespace: string | any[] | ArrayLike<number>,
    buf: { [x: string]: number | undefined },
    offset: number
  ) {
    let _value = value;
    let _namespace = namespace;
    let _offset = offset;

    if (isString(_value)) {
      _value = stringToBytes(_value);
    }

    if (isString(_namespace)) {
      _namespace = parse(_namespace);
    }
    if (_namespace?.length !== 16) {
      throw TypeError(
        "Namespace must be array-like (16 iterable integer values, 0-255)"
      );
    }

    // Compute hash of _namespace and _value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashFn([..._namespace, ... _value])`
    let bytes = new Uint8Array(16 + _value.length);
    bytes.set(_namespace);
    bytes.set(_value, _namespace.length);
    bytes = hashFn(bytes);

    if (bytes[6]) {
      bytes[6] = (bytes[6] & 0x0f) | version;
    }
    if (bytes[8]) {
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
    }

    if (buf) {
      _offset = _offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[_offset + i] = bytes[i];
      }

      return buf;
    }

    return unsafeStringify(Array.from(bytes));
  }

  // Function#name is not settable on some platforms (#270)
  try {
    generateUUID.name = name;
    // eslint-disable-next-line no-empty
  } catch (_) {}

  // For CommonJS default export support
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;

  return generateUUID;
}

export const uuid = uuid5("v5", 0x50, sha1);
