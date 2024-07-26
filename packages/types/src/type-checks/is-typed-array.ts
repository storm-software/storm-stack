/**
 * Check if the provided value is a typed array
 * @param obj - The value to check
 * @returns An indicator specifying if the value provided is a typed array
 */
export function isTypedArray(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
): obj is
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | Float32Array
  | Float64Array {
  return (
    obj instanceof Uint8Array ||
    obj instanceof Uint8ClampedArray ||
    obj instanceof Uint16Array ||
    obj instanceof Uint32Array ||
    obj instanceof BigUint64Array ||
    obj instanceof Int8Array ||
    obj instanceof Int16Array ||
    obj instanceof Int32Array ||
    obj instanceof BigInt64Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array
  );
}
