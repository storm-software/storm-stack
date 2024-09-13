/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { BuildTuple, IsEqual } from "./base";
import { IsNegative, NegativeInfinity, PositiveInfinity } from "./number";
import { StringLength, StringToNumber } from "./string";

/**
 * Returns a boolean for whether A is false.
 *
 * @example
 * ```
 * Not<true>;
 * //=> false
 *
 * Not<false>;
 * //=> true
 * ```
 */
export type Not<A extends boolean> = A extends true
  ? false
  : A extends false
    ? true
    : never;

/**
 * Returns a boolean for whether the given `boolean` is not `false`.
 */
export type IsNotFalse<T extends boolean> = [T] extends [false] ? false : true;

export type Or<A extends boolean, B extends boolean> = [
  A,
  B
][number] extends false
  ? false
  : true extends [IsEqual<A, true>, IsEqual<B, true>][number]
    ? true
    : never;
export type And<A extends boolean, B extends boolean> = [
  A,
  B
][number] extends true
  ? true
  : true extends [IsEqual<A, false>, IsEqual<B, false>][number]
    ? false
    : never;

/**
 * Returns a boolean for whether `A` represents a number greater than `B`, where `A` and `B` are both positive numeric characters.
 *
 * @example
 * ```
 * PositiveNumericCharacterGt<'5', '1'>;
 * //=> true
 *
 * PositiveNumericCharacterGt<'1', '1'>;
 * //=> false
 * ```
 */
export type PositiveNumericCharacterGt<
  A extends string,
  B extends string
> = NumericString extends `${infer HeadA}${A}${infer TailA}`
  ? NumericString extends `${infer HeadB}${B}${infer TailB}`
    ? HeadA extends `${HeadB}${infer _}${infer __}`
      ? true
      : false
    : never
  : never;

/**
 * Returns a boolean for whether `A` represents a number greater than `B`, where `A` and `B` are both numeric strings and have the same length.
 *
 * @example
 * ```
 * SameLengthPositiveNumericStringGt<'50', '10'>;
 * //=> true
 *
 * SameLengthPositiveNumericStringGt<'10', '10'>;
 * //=> false
 * ```
 */
export type SameLengthPositiveNumericStringGt<
  A extends string,
  B extends string
> = A extends `${infer FirstA}${infer RestA}`
  ? B extends `${infer FirstB}${infer RestB}`
    ? FirstA extends FirstB
      ? SameLengthPositiveNumericStringGt<RestA, RestB>
      : PositiveNumericCharacterGt<FirstA, FirstB>
    : never
  : false;

type NumericString = "0123456789";

/**
 * Returns a boolean for whether `A` is greater than `B`, where `A` and `B` are both positive numeric strings.
 *
 * @example
 * ```
 * PositiveNumericStringGt<'500', '1'>;
 * //=> true
 *
 * PositiveNumericStringGt<'1', '1'>;
 * //=> false
 *
 * PositiveNumericStringGt<'1', '500'>;
 * //=> false
 * ```
 */
export type PositiveNumericStringGt<
  A extends string,
  B extends string
> = A extends B
  ? false
  : [
        BuildTuple<StringLength<A>, 0>,
        BuildTuple<StringLength<B>, 0>
      ] extends infer R extends [readonly unknown[], readonly unknown[]]
    ? R[0] extends [...R[1], ...infer Remain extends readonly unknown[]]
      ? 0 extends Remain["length"]
        ? SameLengthPositiveNumericStringGt<A, B>
        : true
      : false
    : never;

export type LessThan<A extends number, B extends number> = number extends A | B
  ? never
  : GreaterThanOrEqual<A, B> extends true
    ? false
    : true;

export type GreaterThan<A extends number, B extends number> = number extends
  | A
  | B
  ? never
  : [
        IsEqual<A, PositiveInfinity>,
        IsEqual<A, NegativeInfinity>,
        IsEqual<B, PositiveInfinity>,
        IsEqual<B, NegativeInfinity>
      ] extends infer R extends [boolean, boolean, boolean, boolean]
    ? Or<
        And<IsEqual<R[0], true>, IsEqual<R[2], false>>,
        And<IsEqual<R[3], true>, IsEqual<R[1], false>>
      > extends true
      ? true
      : Or<
            And<IsEqual<R[1], true>, IsEqual<R[3], false>>,
            And<IsEqual<R[2], true>, IsEqual<R[0], false>>
          > extends true
        ? false
        : true extends R[number]
          ? false
          : [IsNegative<A>, IsNegative<B>] extends infer R extends [
                boolean,
                boolean
              ]
            ? [true, false] extends R
              ? false
              : [false, true] extends R
                ? true
                : [false, false] extends R
                  ? PositiveNumericStringGt<`${A}`, `${B}`>
                  : PositiveNumericStringGt<
                      `${NumberAbsolute<B>}`,
                      `${NumberAbsolute<A>}`
                    >
            : never
    : never;
export type GreaterThanOrEqual<
  A extends number,
  B extends number
> = number extends A | B ? never : A extends B ? true : GreaterThan<A, B>;

/**
 * Returns the minimum value from a tuple of integers.
 *
 * Note:
 * - Float numbers are not supported.
 *
 * @example
 * ```
 * ArrayMin<[1, 2, 5, 3]>;
 * //=> 1
 *
 * ArrayMin<[1, 2, 5, 3, -5]>;
 * //=> -5
 * ```
 */
export type ArrayMin<
  A extends number[],
  Result extends number = PositiveInfinity
> = number extends A[number]
  ? never
  : A extends [infer F extends number, ...infer R extends number[]]
    ? LessThan<F, Result> extends true
      ? ArrayMin<R, F>
      : ArrayMin<R, Result>
    : Result;

/**
 * Returns the maximum value from a tuple of integers.
 *
 * Note:
 * - Float numbers are not supported.
 *
 * @example
 * ```
 * ArrayMax<[1, 2, 5, 3]>;
 * //=> 5
 *
 * ArrayMax<[1, 2, 5, 3, 99, -1]>;
 * //=> 99
 * ```
 */
export type ArrayMax<
  A extends number[],
  Result extends number = NegativeInfinity
> = number extends A[number]
  ? never
  : A extends [infer F extends number, ...infer R extends number[]]
    ? GreaterThan<F, Result> extends true
      ? ArrayMax<R, F>
      : ArrayMax<R, Result>
    : Result;

/**
 * Returns the absolute value of a given value.
 *
 * @example
 * ```
 * NumberAbsolute<-1>;
 * //=> 1
 *
 * NumberAbsolute<1>;
 * //=> 1
 *
 * NumberAbsolute<NegativeInfinity>
 * //=> PositiveInfinity
 * ```
 */
export type NumberAbsolute<N extends number> =
  `${N}` extends `-${infer StringPositiveN}`
    ? StringToNumber<StringPositiveN>
    : N;

export type Subtract<A extends number, B extends number> = number extends A | B
  ? number
  : [
        IsEqual<A, PositiveInfinity>,
        IsEqual<A, NegativeInfinity>,
        IsEqual<B, PositiveInfinity>,
        IsEqual<B, NegativeInfinity>
      ] extends infer R extends [boolean, boolean, boolean, boolean]
    ? Or<
        And<IsEqual<R[0], true>, IsEqual<R[2], false>>,
        And<IsEqual<R[3], true>, IsEqual<R[1], false>>
      > extends true
      ? PositiveInfinity
      : Or<
            And<IsEqual<R[1], true>, IsEqual<R[3], false>>,
            And<IsEqual<R[2], true>, IsEqual<R[0], false>>
          > extends true
        ? NegativeInfinity
        : true extends R[number]
          ? number
          : [IsNegative<A>, IsNegative<B>] extends infer R
            ? [false, false] extends R
              ? BuildTuple<A> extends infer R
                ? R extends [...BuildTuple<B>, ...infer R]
                  ? R["length"]
                  : number
                : never
              : LessThan<A, B> extends true
                ? number
                : [false, true] extends R
                  ? Sum<A, NumberAbsolute<B>>
                  : Subtract<NumberAbsolute<B>, NumberAbsolute<A>>
            : never
    : never;

export type Sum<A extends number, B extends number> = number extends A | B
  ? number
  : [
        IsEqual<A, PositiveInfinity>,
        IsEqual<A, NegativeInfinity>,
        IsEqual<B, PositiveInfinity>,
        IsEqual<B, NegativeInfinity>
      ] extends infer R extends [boolean, boolean, boolean, boolean]
    ? Or<
        And<IsEqual<R[0], true>, IsEqual<R[3], false>>,
        And<IsEqual<R[2], true>, IsEqual<R[1], false>>
      > extends true
      ? PositiveInfinity
      : Or<
            And<IsEqual<R[1], true>, IsEqual<R[2], false>>,
            And<IsEqual<R[3], true>, IsEqual<R[0], false>>
          > extends true
        ? NegativeInfinity
        : true extends R[number]
          ? number
          : ([IsNegative<A>, IsNegative<B>] extends infer R
              ? [false, false] extends R
                ? [...BuildTuple<A>, ...BuildTuple<B>]["length"]
                : [true, true] extends R
                  ? number
                  : ArrayMax<
                        [NumberAbsolute<A>, NumberAbsolute<B>]
                      > extends infer Max_
                    ? ArrayMin<
                        [NumberAbsolute<A>, NumberAbsolute<B>]
                      > extends infer Min_ extends number
                      ? Max_ extends A | B
                        ? Subtract<Max_, Min_>
                        : number
                      : never
                    : never
              : never) &
              number
    : never;
