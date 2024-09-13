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

import type {
  StaticPartOfArray,
  UnknownArray,
  VariablePartOfArray
} from "./array";
import type {
  BuildTuple,
  EmptyObject,
  IsAny,
  IsNever,
  IsPrimitive,
  NonRecursiveType,
  Nullish,
  Primitive,
  Simplify
} from "./base";
import type { StringKeyOf } from "./json";
import type { IsNotFalse, LessThan, Sum } from "./logic";
import type { Numeric } from "./number";
import type { StringDigit } from "./string";
import type { Index40, Nullable } from "./utilities";

export type IsEmptyObject<T> = T extends EmptyObject ? true : false;

/**
 * Returns a boolean for whether the given type is a plain key-value object.
 */
export type IsPlainObject<T> = T extends
  | NonRecursiveType
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  | UnknownArray
  ? false
  : T extends object
    ? true
    : false;

type LiteralCheck<T, LiteralType extends Primitive> =
  IsNever<T> extends false // Must be wider than `never`
    ? [T] extends [LiteralType & infer U] // Remove any branding
      ? [U] extends [LiteralType] // Must be narrower than `LiteralType`
        ? [LiteralType] extends [U] // Cannot be wider than `LiteralType`
          ? false
          : true
        : false
      : false
    : false;

type LiteralChecks<T, LiteralUnionType> =
  // Conditional type to force union distribution.
  // If `T` is none of the literal types in the union `LiteralUnionType`, then `LiteralCheck<T, LiteralType>` will evaluate to `false` for the whole union.
  // If `T` is one of the literal types in the union, it will evaluate to `boolean` (i.e. `true | false`)
  IsNotFalse<
    LiteralUnionType extends Primitive
      ? LiteralCheck<T, LiteralUnionType>
      : never
  >;

export type IsStringLiteral<T> = LiteralCheck<T, string>;
export type IsNumericLiteral<T> = LiteralChecks<T, Numeric>;
export type IsBooleanLiteral<T> = LiteralCheck<T, boolean>;
export type IsSymbolLiteral<T> = LiteralCheck<T, symbol>;

type IsLiteralUnion<T> =
  | IsBooleanLiteral<T>
  | IsNumericLiteral<T>
  | IsStringLiteral<T>
  | IsSymbolLiteral<T>;

export type IsLiteral<T> =
  IsPrimitive<T> extends true ? IsNotFalse<IsLiteralUnion<T>> : false;

/**
 * Returns a boolean for whether the given type is an object.
 */
export type LiteralKeyOf<T> = keyof {
  [K in keyof T as IsLiteral<K> extends true ? K : never]-?: never;
};

/**
 * Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
 *
 * Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.
 *
 * This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.
 *
 * @example
 * ```
 * import type {LiteralUnion} from 'type-fest';
 *
 * // Before
 *
 * type Pet = 'dog' | 'cat' | string;
 *
 * const pet: Pet = '';
 * // Start typing in your TypeScript-enabled IDE.
 * // You **will not** get auto-completion for `dog` and `cat` literals.
 *
 * // After
 *
 * type Pet2 = LiteralUnion<'dog' | 'cat', string>;
 *
 * const pet: Pet2 = '';
 * // You **will** get auto-completion for `dog` and `cat` literals.
 * ```
 *
 * @category Type
 */
export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | (BaseType & Record<never, never>)
  | LiteralType;

/**
 * Create an object type with the given key `<Key>` and value `<Value>`.
 *
 * It will copy the prefix and optional status of the same key from the given object `CopiedFrom` into the result.
 *
 * @example
 * ```
 * type A = BuildObject<'a', string>;
 * //=> {a: string}
 *
 * // Copy `readonly` and `?` from the key `a` of `{readonly a?: any}`
 * type B = BuildObject<'a', string, {readonly a?: any}>;
 * //=> {readonly a?: string}
 * ```
 */
export type BuildObject<
  Key extends PropertyKey,
  Value,
  CopiedFrom extends object = {}
> = Key extends keyof CopiedFrom
  ? Pick<{ [_ in keyof CopiedFrom]: Value }, Key>
  : Key extends `${infer NumberKey extends number}`
    ? NumberKey extends keyof CopiedFrom
      ? Pick<{ [_ in keyof CopiedFrom]: Value }, NumberKey>
      : { [_ in Key]: Value }
    : { [_ in Key]: Value };

/**
 * Return a string representation of the given string or number.
 *
 * Note: This type is not the return type of the `.toString()` function.
 */
export type ToString<T> = T extends number | string ? `${T}` : never;

/**
 * Extract the object field type if T is an object and K is a key of T, return `never` otherwise.
 *
 * It creates a type-safe way to access the member type of `unknown` type.
 */
export type ObjectValue<T, K> = K extends keyof T
  ? T[K]
  : ToString<K> extends keyof T
    ? T[ToString<K>]
    : K extends `${infer NumberK extends number}`
      ? NumberK extends keyof T
        ? T[NumberK]
        : never
      : never;

export type Paths<T> = Paths_<T>;

type Paths_<T, Depth extends number = 0> = T extends
  | NonRecursiveType
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  ? never
  : IsAny<T> extends true
    ? never
    : T extends UnknownArray
      ? number extends T["length"]
        ? // We need to handle the fixed and non-fixed index part of the array separately.
          | InternalPaths<VariablePartOfArray<T>[number][], Depth>
            | InternalPaths<StaticPartOfArray<T>, Depth>
        : InternalPaths<T, Depth>
      : T extends object
        ? InternalPaths<T, Depth>
        : never;

export type InternalPaths<
  _T,
  Depth extends number = 0,
  T = Required<_T>
> = T extends EmptyObject | readonly []
  ? never
  : {
      [Key in keyof T]: Key extends number | string // Limit `Key` to string or number.
        ? // If `Key` is a number, return `Key | `${Key}``, because both `array[0]` and `array['0']` work.
          | Key
            | (LessThan<Depth, 15> extends true // Limit the depth to prevent infinite recursion
                ? IsNever<Paths_<T[Key], Sum<Depth, 1>>> extends false
                  ? `${Key}.${Paths_<T[Key], Sum<Depth, 1>>}`
                  : never
                : never)
            | ToString<Key>
        : never;
    }[(T extends UnknownArray ? number : unknown) & keyof T];

interface GetOptions {
  /**
   * Include `undefined` in the return type when accessing properties.
   *
   * Setting this to `false` is not recommended.
   *
   * @defaultValue `true`
   */
  strict?: boolean;
}

/**
 * Like the `Get` type but receives an array of strings as a path parameter.
 */
export type GetWithPath<
  BaseType,
  Keys extends readonly string[],
  Options extends GetOptions = {}
> = Keys extends readonly []
  ? BaseType
  : Keys extends readonly [infer Head, ...infer Tail]
    ? GetWithPath<
        PropertyOf<BaseType, Extract<Head, string>, Options>,
        Extract<Tail, string[]>,
        Options
      >
    : never;

/**
 * Adds `undefined` to `Type` if `strict` is enabled.
 */
type Strictify<
  Type,
  Options extends GetOptions
> = Options["strict"] extends false ? Type : Type | undefined;

/**
 *  If `Options['strict']` is `true`, includes `undefined` in the returned type when accessing properties on `Record<string, any>`.
 *
 *  Known limitations:
 *  - Does not include `undefined` in the type on object types with an index signature (for example, `{a: string; [key: string]: string}`).
 */
type StrictPropertyOf<
  BaseType,
  Key extends keyof BaseType,
  Options extends GetOptions
> =
  Record<string, any> extends BaseType
    ? string extends keyof BaseType
      ? Strictify<BaseType[Key], Options> // Record<string, any>
      : BaseType[Key] // Record<'a' | 'b', any> (Records with a string union as keys have required properties)
    : BaseType[Key];

/**
 * Represents an array of strings split using a given character or character set.
 *
 * Use-case: Defining the return type of a method like `String.prototype.split`.
 *
 * @example
 * ```
 * import type {Split} from 'type-fest';
 *
 * declare function split<S extends string, D extends string>(string: S, separator: D): Split<S, D>;
 *
 * type Item = 'foo' | 'bar' | 'baz' | 'waldo';
 * const items = 'foo,bar,baz,waldo';
 * let array: Item[];
 *
 * array = split(items, ',');
 * ```
 *
 * @category String
 * @category Template literal
 */
export type Split<
  S extends string,
  Delimiter extends string
> = S extends `${infer Head}${Delimiter}${infer Tail}`
  ? [Head, ...Split<Tail, Delimiter>]
  : S extends Delimiter
    ? []
    : [S];

/**
 * Splits a dot-prop style path into a tuple comprised of the properties in the path. Handles square-bracket notation.
 *
 * @example
 * ```
 * ToPath<'foo.bar.baz'>
 * //=> ['foo', 'bar', 'baz']
 *
 * ToPath<'foo[0].bar.baz'>
 * //=> ['foo', '0', 'bar', 'baz']
 * ```
 */
export type ToPath<S extends string> = Split<FixPathSquareBrackets<S>, ".">;

/**
 * Replaces square-bracketed dot notation with dots, for example, `foo[0].bar` -> `foo.0.bar`.
 */
type FixPathSquareBrackets<Path extends string> =
  Path extends `[${infer Head}]${infer Tail}`
    ? Tail extends `[${string}`
      ? `${Head}.${FixPathSquareBrackets<Tail>}`
      : `${Head}${FixPathSquareBrackets<Tail>}`
    : Path extends `${infer Head}[${infer Middle}]${infer Tail}`
      ? `${Head}.${FixPathSquareBrackets<`[${Middle}]${Tail}`>}`
      : Path;

/**
 * Returns true if `LongString` is made up out of `Substring` repeated 0 or more times.
 *
 * @example
 * ```ts
 * ConsistsOnlyOf<'aaa', 'a'> //=> true
 * ConsistsOnlyOf<'ababab', 'ab'> //=> true
 * ConsistsOnlyOf<'aBa', 'a'> //=> false
 * ConsistsOnlyOf<'', 'a'> //=> true
 * ```
 *
 */
type ConsistsOnlyOf<
  LongString extends string,
  Substring extends string
> = LongString extends ""
  ? true
  : LongString extends `${Substring}${infer Tail}`
    ? ConsistsOnlyOf<Tail, Substring>
    : false;

/**
 * Convert a type which may have number keys to one with string keys, making it possible to index using strings retrieved from template types.
 *
 * @example
 *
 * ```ts
 * type WithNumbers = {foo: string; 0: boolean};
 * type WithStrings = WithStringKeys<WithNumbers>;
 *
 * type WithNumbersKeys = keyof WithNumbers;
 * //=> 'foo' | 0
 * type WithStringsKeys = keyof WithStrings;
 * //=> 'foo' | '0'
 * ```
 *
 */
type WithStringKeys<BaseType> = {
  [Key in StringKeyOf<BaseType>]: UncheckedIndex<BaseType, Key>;
};

/**
    Perform a `T[U]` operation if `T` supports indexing.
    */
type UncheckedIndex<T, U extends number | string> = [T] extends [
  Record<number | string, any>
]
  ? T[U]
  : never;

/**
 *  Get a property of an object or array. Works when indexing arrays using number-literal-strings, for example, `PropertyOf<number[], '0'> = number`, and when indexing objects with number keys.
 *
 * Note:
 * - Returns `unknown` if `Key` is not a property of `BaseType`, since TypeScript uses structural typing, and it cannot be guaranteed that extra properties unknown to the type system will exist at runtime.
 * - Returns `undefined` from nullish values, to match the behavior of most deep-key libraries like `lodash`, `dot-prop`, etc.
 */
type PropertyOf<
  BaseType,
  Key extends string,
  Options extends GetOptions = {}
> = BaseType extends Nullish
  ? undefined
  : Key extends keyof BaseType
    ? StrictPropertyOf<BaseType, Key, Options>
    : BaseType extends readonly [] | readonly [unknown, ...unknown[]]
      ? unknown // It's a tuple, but `Key` did not extend `keyof BaseType`. So the index is out of bounds.
      : BaseType extends {
            [n: number]: infer Item;
            length: number; // Note: This is needed to avoid being too lax with records types using number keys like `{0: string; 1: boolean}`.
          }
        ? ConsistsOnlyOf<Key, StringDigit> extends true
          ? Strictify<Item, Options>
          : unknown
        : Key extends keyof WithStringKeys<BaseType>
          ? StrictPropertyOf<WithStringKeys<BaseType>, Key, Options>
          : unknown;

// This works by first splitting the path based on `.` and `[...]` characters into a tuple of string keys. Then it recursively uses the head key to get the next property of the current object, until there are no keys left. Number keys extract the item type from arrays, or are converted to strings to extract types from tuples and dictionaries with number keys.
/**
 * Get a deeply-nested property from an object using a key path, like Lodash's `.get()` function.
 *
 * Use-case: Retrieve a property from deep inside an API response or some other complex object.
 *
 * @example
 * ```
 * import type {Get} from 'type-fest';
 * import * as lodash from 'lodash';
 *
 * const get = <BaseType, Path extends string | readonly string[]>(object: BaseType, path: Path): Get<BaseType, Path> =>
 *   lodash.get(object, path);
 *
 * interface ApiResponse {
 *   hits: {
 *     hits: Array<{
 *       _id: string
 *       _source: {
 *         name: Array<{
 *           given: string[]
 *           family: string
 *         }>
 *         birthDate: string
 *       }
 *     }>
 *   }
 * }
 *
 * const getName = (apiResponse: ApiResponse) =>
 *   get(apiResponse, 'hits.hits[0]._source.name');
 *   //=> Array<{given: string[]; family: string}> | undefined
 *
 * // Path also supports a readonly array of strings
 * const getNameWithPathArray = (apiResponse: ApiResponse) =>
 *   get(apiResponse, ['hits','hits', '0', '_source', 'name'] as const);
 *   //=> Array<{given: string[]; family: string}> | undefined
 *
 * // Non-strict mode:
 * Get<string[], '3', {strict: false}> //=> string
 * Get<Record<string, string>, 'foo', {strict: true}> // => string
 * ```
 *
 * @category Object
 * @category Array
 * @category Template literal
 */
export type Get<
  BaseType,
  Path extends readonly string[] | string,
  Options extends GetOptions = {}
> = GetWithPath<BaseType, Path extends string ? ToPath<Path> : Path, Options>;

/**
 * Convert a union type to an intersection type using [distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
 *
 * Inspired by [this Stack Overflow answer](https://stackoverflow.com/a/50375286/2172153).
 *
 * @example
 * ```
 * import type {UnionToIntersection} from 'type-fest';
 *
 * type Union = {the(): void} | {great(arg: string): void} | {escape: boolean};
 *
 * type Intersection = UnionToIntersection<Union>;
 * //=> {the(): void; great(arg: string): void; escape: boolean};
 * ```
 *
 * A more applicable example which could make its way into your library code follows.
 *
 * @example
 * ```
 * import type {UnionToIntersection} from 'type-fest';
 *
 * class CommandOne {
 *  commands: {
 *    a1: () => undefined,
 *    b1: () => undefined,
 *  }
 * }
 *
 * class CommandTwo {
 *  commands: {
 *    a2: (argA: string) => undefined,
 *    b2: (argB: string) => undefined,
 *  }
 * }
 *
 * const union = [new CommandOne(), new CommandTwo()].map(instance => instance.commands);
 * type Union = typeof union;
 * //=> {a1(): void; b1(): void} | {a2(argA: string): void; b2(argB: string): void}
 *
 * type Intersection = UnionToIntersection<Union>;
 * //=> {a1(): void; b1(): void; a2(argA: string): void; b2(argB: string): void}
 * ```
 *
 * @category Type
 */
export type UnionToIntersection<Union> =
  // `extends unknown` is always going to be the case and is used to convert the
  // `Union` into a [distributive conditional
  // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
  (
    Union extends unknown
      ? // The union type is used as the only argument to a function since the union
        // of function arguments is an intersection.
        (_distributedUnion: Union) => void
      : // This won't happen.
        never
  ) extends // Infer the `Intersection` type since TypeScript represents the positional
  // arguments of unions of functions as an intersection of the union.
  (_mergedIntersection: infer Intersection) => void
    ? // The `& Union` is to allow indexing by the resulting type
      Intersection & Union
    : never;

/**
 * Pick properties from a deeply-nested object.
 *
 * It supports recursing into arrays.
 *
 * Use-case: Distill complex objects down to the components you need to target.
 *
 * @example
 * ```
 * import type {PickDeep, PartialDeep} from 'type-fest';
 *
 * type Configuration = {
 *  userConfig: {
 *    name: string;
 *    age: number;
 *    address: [
 *      {
 *        city1: string;
 *        street1: string;
 *      },
 *      {
 *        city2: string;
 *        street2: string;
 *      }
 *    ]
 *  };
 *  otherConfig: any;
 * };
 *
 * type NameConfig = PickDeep<Configuration, 'userConfig.name'>;
 * // type NameConfig = {
 * //  userConfig: {
 * //    name: string;
 * //  }
 * // };
 *
 * // Supports optional properties
 * type User = PickDeep<PartialDeep<Configuration>, 'userConfig.name' | 'userConfig.age'>;
 * // type User = {
 * //  userConfig?: {
 * //    name?: string;
 * //    age?: number;
 * //  };
 * // };
 *
 * // Supports array
 * type AddressConfig = PickDeep<Configuration, 'userConfig.address.0'>;
 * // type AddressConfig = {
 * //  userConfig: {
 * //    address: [{
 * //      city1: string;
 * //      street1: string;
 * //    }];
 * //   };
 * // }
 *
 * // Supports recurse into array
 * type Street = PickDeep<Configuration, 'userConfig.address.1.street2'>;
 * // type Street = {
 * //  userConfig: {
 * //    address: [
 * //      unknown,
 * //      {street2: string}
 * //    ];
 * //  };
 * // }
 * ```
 *
 * @category Object
 * @category Array
 */
export type PickDeep<T, PathUnion extends Paths<T>> = T extends NonRecursiveType
  ? never
  : T extends UnknownArray
    ? UnionToIntersection<
        {
          [P in PathUnion]: InternalPickDeep<T, P>;
        }[PathUnion]
      >
    : T extends object
      ? Simplify<
          UnionToIntersection<
            {
              [P in PathUnion]: InternalPickDeep<T, P>;
            }[PathUnion]
          >
        >
      : never;

/**
 * Pick an object/array from the given object/array by one path.
 */
type InternalPickDeep<
  T,
  Path extends number | string
> = T extends NonRecursiveType
  ? never
  : T extends UnknownArray
    ? PickDeepArray<T, Path>
    : T extends object
      ? Simplify<PickDeepObject<T, Path>>
      : never;

/**
 * Pick an object from the given object by one path.
 */
type PickDeepObject<
  RecordType extends object,
  P extends number | string
> = P extends `${infer RecordKeyInPath}.${infer SubPath}`
  ? ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
    ? IsNever<ObjectV> extends false
      ? BuildObject<
          RecordKeyInPath,
          InternalPickDeep<NonNullable<ObjectV>, SubPath>,
          RecordType
        >
      : never
    : never
  : ObjectValue<RecordType, P> extends infer ObjectV
    ? IsNever<ObjectV> extends false
      ? BuildObject<P, ObjectV, RecordType>
      : never
    : never;

/**
 * Pick an array from the given array by one path.
 */
type PickDeepArray<ArrayType extends UnknownArray, P extends number | string> =
  // Handle paths that are `${number}.${string}`
  P extends `${infer ArrayIndex extends number}.${infer SubPath}`
    ? // When `ArrayIndex` is equal to `number`
      number extends ArrayIndex
      ? ArrayType extends unknown[]
        ? InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>[]
        : ArrayType extends readonly unknown[]
          ? readonly InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>[]
          : never
      : // When `ArrayIndex` is a number literal
        ArrayType extends unknown[]
        ? [
            ...BuildTuple<ArrayIndex>,
            InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>
          ]
        : ArrayType extends readonly unknown[]
          ? readonly [
              ...BuildTuple<ArrayIndex>,
              InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>
            ]
          : never
    : // When the path is equal to `number`
      P extends `${infer ArrayIndex extends number}`
      ? // When `ArrayIndex` is `number`
        number extends ArrayIndex
        ? ArrayType
        : // When `ArrayIndex` is a number literal
          ArrayType extends unknown[]
          ? [...BuildTuple<ArrayIndex>, ArrayType[ArrayIndex]]
          : ArrayType extends readonly unknown[]
            ? readonly [...BuildTuple<ArrayIndex>, ArrayType[ArrayIndex]]
            : never
      : never;

// Is this type a tuple?
type IsTuple<T> = T extends { length: infer Length } & readonly any[]
  ? Length extends Index40
    ? T
    : never
  : never;

// If this type is a tuple, what indices are allowed?
type AllowedIndexes<
  Tuple extends readonly any[],
  Keys extends number = never
> = Tuple extends readonly []
  ? Keys
  : Tuple extends readonly [infer _First, ...infer Tail]
    ? AllowedIndexes<Tail, Keys | Tail["length"]>
    : Keys;

type PrefixArrayAccessor<T extends any[], TDepth extends any[]> = {
  [K in keyof T]: `[${number}]${DeepKey<T[K], TDepth>}`;
}[number];

type PrefixTupleAccessor<
  T extends any[],
  TIndex extends number,
  TDepth extends any[]
> = {
  [K in TIndex]: `[${K}]${DeepKey<T[K], TDepth>}` | `[${K}]`;
}[TIndex];

type PrefixObjectAccessor<T extends object, TDepth extends any[]> = {
  [K in keyof T]-?: K extends number | string
    ?
        | `${PrefixFromDepth<K, TDepth>}${DeepKey<T[K], [TDepth]>}`
        | PrefixFromDepth<K, TDepth>
    : never;
}[keyof T];

type PrefixFromDepth<
  T extends number | string,
  TDepth extends any[]
> = TDepth["length"] extends 0 ? T : `.${T}`;

export type DeepKey<T, TDepth extends any[] = []> = TDepth["length"] extends 5
  ? never
  : unknown extends T
    ? PrefixFromDepth<string, TDepth>
    : T extends IsTuple<T> & any[]
      ? PrefixTupleAccessor<T, AllowedIndexes<T>, TDepth>
      : T extends any[]
        ? PrefixArrayAccessor<T, [...TDepth, any]>
        : T extends Date
          ? never
          : T extends object
            ? PrefixObjectAccessor<T, TDepth>
            : T extends bigint | boolean | number | string
              ? ""
              : never;

// export type DeepKey<
//   TObject extends Record<string, unknown>,
//   TKey = keyof TObject
// > = TKey extends string
//   ? TObject[TKey] extends Record<string, unknown>
//     ? `${TKey}.${DeepKey<TObject[TKey]>}`
//     : `${TKey}`
//   : never;

export type DeepValue<
  TObject extends Record<string, unknown>,
  TPath extends DeepKey<TObject>
> = GetWithPath<TObject, ToPath<TPath>>;

export type NullableDeepValue<
  TObject extends Record<string, unknown>,
  TPath extends DeepKey<TObject>
> = Nullable<GetWithPath<TObject, ToPath<TPath>>>;
