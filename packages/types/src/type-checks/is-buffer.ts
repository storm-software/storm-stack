// import { Buffer } from "buffer/";

// eslint-disable-next-line unicorn/no-typeof-undefined
export const isBufferExists = typeof Buffer !== "undefined";

/**
 * Check if the provided value's type is `Buffer`
 */
export const isBuffer: typeof Buffer.isBuffer = isBufferExists
  ? Buffer.isBuffer.bind(Buffer)
  : /**
   * Check if the provided value's type is `Buffer`

   * @param value - The value to type check
   * @returns An indicator specifying if the value provided is of type `Buffer`
   */
    function isBuffer(
      value: Parameters<typeof Buffer.isBuffer>[0]
    ): value is Buffer {
      return false;
    };
