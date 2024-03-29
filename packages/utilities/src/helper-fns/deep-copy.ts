import { Buffer } from "buffer/";
import { isBufferExists, isCollection, typeDetect } from "../type-checks";
import {
  type Collection,
  TYPE_ARGUMENTS,
  TYPE_ARRAY,
  TYPE_MAP,
  TYPE_OBJECT,
  TYPE_SET
} from "../types";

/**
 * Get keys from Collection
 *
 * @private
 * @param collection
 * @param collectionType
 */
function getKeys(collection: Collection, collectionType: string): Array<string | symbol> {
  switch (collectionType) {
    case TYPE_ARGUMENTS:
    case TYPE_ARRAY:
      return Object.keys(collection as string[]);
    case TYPE_OBJECT:
      return ([] as Array<string | symbol>).concat(
        // NOTE: Object.getOwnPropertyNames can get all own keys.
        Object.keys(collection as Record<string, unknown>),
        Object.getOwnPropertySymbols(collection as Record<symbol, unknown>)
      );
    case TYPE_MAP:
    case TYPE_SET:
      return Array.from((collection as Set<string | symbol>).keys());
    default:
      return [];
  }
}

/**
 * Get value from Collection
 *
 * @private
 * @param collection
 * @param key
 * @param collectionType
 */
function getValue(collection: Collection, key: unknown, collectionType: string): any {
  switch (collectionType) {
    case TYPE_ARGUMENTS:
    case TYPE_ARRAY:
    case TYPE_OBJECT:
      return (collection as Record<string, unknown>)[key as string];
    case TYPE_MAP:
      return (collection as Map<unknown, unknown>).get(key);
    case TYPE_SET:
      // NOTE: Set.prototype.keys is alias of Set.prototype.values. It means key equals to value.
      return key;
    default:
  }

  return undefined;
}

/**
 * Set value to collection
 *
 * @param collection
 * @param key
 * @param value
 * @param collectionType
 */
function setValue(
  collection: Collection,
  key: unknown,
  value: unknown,
  collectionType: string
): Collection {
  switch (collectionType) {
    case TYPE_ARGUMENTS:
    case TYPE_ARRAY:
    case TYPE_OBJECT:
      (collection as Record<string, unknown>)[key as string] = value;
      break;
    case TYPE_MAP:
      (collection as Map<unknown, unknown>).set(key, value);
      break;
    case TYPE_SET:
      (collection as Set<unknown>).add(value);
      break;
    default:
  }

  return collection;
}

/**
 * Clone the buffer instance.
 */
const cloneBuffer: typeof Buffer.from = isBufferExists
  ? Buffer.from.bind(Buffer)
  : /**
     * Clone the buffer instance.
     *
     * @param value
     * @returns argument used if Buffer unsupported
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function cloneBuffer(value: unknown): any {
      return value;
    };

/**
 * clone value
 *
 * @private
 * @param value
 * @param valueType
 */
function clone(value: unknown, valueType: string): unknown {
  switch (valueType) {
    // deep copy
    case "ArrayBuffer":
      return (value as ArrayBuffer).slice(0);
    case "Boolean":
      return new Boolean((value as boolean).valueOf());
    case "Buffer":
      return cloneBuffer(value as Buffer);
    case "DataView":
      return new DataView((value as DataView).buffer);
    case "Date":
      return new Date((value as Date).getTime());
    case "Number":
      return new Number(value as number);
    case "RegExp":
      return new RegExp((value as RegExp).source, (value as RegExp).flags);
    case "String":
      return new String(value as string);

    // typed arrays
    case "Float32Array":
      return new Float32Array(value as Float32Array);
    case "Float64Array":
      return new Float64Array(value as Float64Array);
    case "Int16Array":
      return new Int16Array(value as Int16Array);
    case "Int32Array":
      return new Int32Array(value as Int32Array);
    case "Int8Array":
      return new Int8Array(value as Int8Array);
    case "Uint16Array":
      return new Uint16Array(value as Uint16Array);
    case "Uint32Array":
      return new Uint32Array(value as Uint32Array);
    case "Uint8Array":
      return new Uint8Array(value as Uint8Array);
    case "Uint8ClampedArray":
      return new Uint8ClampedArray(value as Uint8ClampedArray);

    // shallow copy
    case "Array Iterator":
      return value;
    case "Map Iterator":
      return value;
    case "Promise":
      return value;
    case "Set Iterator":
      return value;
    case "String Iterator":
      return value;
    case "function":
      return value;
    case "global":
      return value;
    // NOTE: WeakMap and WeakSet cannot get entries
    case "WeakMap":
      return value;
    case "WeakSet":
      return value;

    // primitives
    case "boolean":
      return value;
    case "null":
      return value;
    case "number":
      return value;
    case "string":
      return value;
    case "symbol":
      return value;
    case "undefined":
      return value;

    // collections
    // NOTE: return empty value: because recursively copy later.
    case TYPE_ARGUMENTS:
      return [];
    case TYPE_ARRAY:
      return [];
    case TYPE_MAP:
      return new Map<unknown, unknown>();
    case TYPE_OBJECT:
      return {};
    case TYPE_SET:
      return new Set<unknown>();

    default:
      return value;
  }
}

/**
 * copy value with customizer function
 *
 * @private
 * @param value
 * @param type
 */
export function copy(
  value: unknown,
  valueType: string,
  customizer: ((value: unknown, type: string) => unknown) | null = null
): unknown {
  if (customizer && valueType === "Object") {
    const result = customizer(value, valueType);

    if (result !== undefined) {
      return result;
    }
  }

  return clone(value, valueType);
}

/**
 * recursively copy
 *
 * @private
 * @param value
 * @param clone
 * @param references
 * @param visited
 * @param customizer
 */
function recursiveCopy(
  value: unknown,
  clone: unknown,
  references: WeakMap<Record<string, unknown>, unknown>,
  visited: WeakSet<Record<string, unknown>>,
  customizer: Parameters<typeof copy>[2]
): unknown {
  const valueType = typeDetect(value);
  const copiedValue = copy(value, valueType);

  // return if not a collection value
  if (!isCollection(valueType)) {
    return copiedValue;
  }

  const keys = getKeys(value as Collection, valueType);

  // walk within collection with iterator
  for (const collectionKey of keys) {
    const collectionValue = getValue(value as Collection, collectionKey, valueType) as Record<
      string,
      unknown
    >;

    if (visited.has(collectionValue)) {
      // for Circular
      setValue(clone as Collection, collectionKey, references.get(collectionValue), valueType);
    } else {
      const collectionValueType = typeDetect(collectionValue);
      const copiedCollectionValue = copy(collectionValue, collectionValueType);

      // save reference if value is collection
      if (isCollection(collectionValueType)) {
        references.set(collectionValue, copiedCollectionValue);
        visited.add(collectionValue);
      }

      setValue(
        clone as Collection,
        collectionKey,
        recursiveCopy(collectionValue, copiedCollectionValue, references, visited, customizer),
        valueType
      );
    }
  }

  return clone;
}

/**
 * Deep copy an object/array/value
 *
 * @param value - The value to copy
 * @param options - The options
 */
export function deepCopy<T>(
  value: T,
  options?: { customizer?: (value: unknown, type: string) => unknown }
): T {
  const {
    customizer = null
    // depth = Infinity,
  } = options || {};

  const valueType = typeDetect(value);
  if (!isCollection(valueType)) {
    return copy(value, valueType, customizer) as T;
  }

  const copiedValue = copy(value, valueType, customizer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const references = new WeakMap<Record<string, any>, unknown>([
    [value as Record<string, any>, copiedValue]
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visited = new WeakSet<Record<string, any>>([value] as Iterable<Record<string, any>>);

  return recursiveCopy(value, copiedValue, references, visited, customizer) as T;
}
