import { isEmpty } from "../type-checks";

export type UnknownArray = readonly unknown[];

/**
 * Matches any [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), like `Uint8Array` or `Float64Array`.
 *
 * @category Array
 */
export type TypedArray =
  | BigInt64Array
  | BigUint64Array
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;

/**
 * Infer the length of the given array `<T>`.
 *
 * @link https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
 */
export type ArrayLength<T extends readonly unknown[]> = T extends {
  readonly length: infer L;
}
  ? L
  : never;

/**
 * Extract the element of an array that also works for array union.
 *
 * Returns `never` if T is not an array.
 *
 * It creates a type-safe way to access the element type of `unknown` type.
 */
export type ArrayElement<T> = T extends readonly unknown[] ? T[0] : never;

/**
 * Provides all values for a constant array or tuple.
 *
 * Use-case: This type is useful when working with constant arrays or tuples and you want to enforce type-safety with their values.
 *
 * @example
 * ```
 * import type {ArrayValues, ArrayIndices} from 'type-fest';
 *
 * const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
 *
 * type WeekdayName = ArrayValues<typeof weekdays>;
 * type Weekday = ArrayIndices<typeof weekdays>;
 *
 * const getWeekdayName = (day: Weekday): WeekdayName => weekdays[day];
 * ```
 *
 * @see {@link ArrayIndices}
 *
 * @category Array
 */
export type ArrayValues<T extends readonly unknown[]> = T[number];

/**
 * Provides valid indices for a constant array or tuple.
 *
 * Use-case: This type is useful when working with constant arrays or tuples and you want to enforce type-safety for accessing elements by their indices.
 *
 * @example
 * ```
 * import type {ArrayIndices, ArrayValues} from 'type-fest';
 *
 * const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
 *
 * type Weekday = ArrayIndices<typeof weekdays>;
 * type WeekdayName = ArrayValues<typeof weekdays>;
 *
 * const getWeekdayName = (day: Weekday): WeekdayName => weekdays[day];
 * ```
 *
 * @see {@link ArrayValues}
 *
 * @category Array
 */
export type ArrayIndices<Element extends readonly unknown[]> = Exclude<
  Partial<Element>["length"],
  Element["length"]
>;

/**
 * Matches any unknown array or tuple.
 */
export type UnknownArrayOrTuple = readonly [...unknown[]];

/**
 * Extracts the type of the first element of an array or tuple.
 */
export type FirstArrayElement<TArray extends UnknownArrayOrTuple> =
  TArray extends readonly [infer THead, ...unknown[]] ? THead : never;

/**
 * Extracts the type of the last element of an array.
 *
 * Use-case: Defining the return type of functions that extract the last element of an array, for example [`lodash.last`](https://lodash.com/docs/4.17.15#last).
 *
 * @example
 * ```
 * import type {LastArrayElement} from 'type-fest';
 *
 * declare function lastOf<V extends readonly any[]>(array: V): LastArrayElement<V>;
 *
 * const array = ['foo', 2];
 *
 * typeof lastOf(array);
 * //=> number
 *
 * const array = ['foo', 2] as const;
 *
 * typeof lastOf(array);
 * //=> 2
 * ```
 *
 * @category Array
 * @category Template literal
 */
export type LastArrayElement<
  Elements extends readonly unknown[],
  ElementBeforeTailingSpreadElement = never
> =
  // If the last element of an array is a spread element, the `LastArrayElement` result should be `'the type of the element before the spread element' | 'the type of the spread element'`.
  Elements extends readonly []
    ? ElementBeforeTailingSpreadElement
    : // eslint-disable-next-line no-unused-vars
      Elements extends readonly [...infer _U, infer V]
      ? V
      : Elements extends readonly [infer U, ...infer V]
        ? // If we return `V[number] | U` directly, it would be wrong for `[[string, boolean, object, ...number[]]`.
          // So we need to recurse type `V` and carry over the type of the element before the spread element.
          LastArrayElement<V, U>
        : Elements extends ReadonlyArray<infer U>
          ? ElementBeforeTailingSpreadElement | U
          : never;

/**
 * Returns the static, fixed-length portion of the given array, excluding variable-length parts.
 *
 * @example
 * ```
 * type A = [string, number, boolean, ...string[]];
 * type B = StaticPartOfArray<A>;
 * //=> [string, number, boolean]
 * ```
 */
export type StaticPartOfArray<
  T extends UnknownArray,
  Result extends UnknownArray = []
> = T extends unknown
  ? number extends T["length"]
    ? T extends readonly [infer U, ...infer V]
      ? StaticPartOfArray<V, [...Result, U]>
      : Result
    : T
  : never; // Should never happen

/**
 * Returns the variable, non-fixed-length portion of the given array, excluding static-length parts.
 *
 * @example
 * ```
 * type A = [string, number, boolean, ...string[]];
 * type B = VariablePartOfArray<A>;
 * //=> string[]
 * ```
 */
export type VariablePartOfArray<T extends UnknownArray> = T extends unknown
  ? T extends readonly [...StaticPartOfArray<T>, ...infer U]
    ? U
    : []
  : never; // Should never happen

export const filterEmpty = <T>(values: Array<T | null | undefined> = []): T[] =>
  values.filter(value => !isEmpty(value)) as T[];
