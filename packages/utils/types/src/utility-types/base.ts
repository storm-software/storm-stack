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

import type { TypedArray } from "./array";

export type SerializablePrimitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | bigint;
export type Primitive = SerializablePrimitive | symbol;

/**
 * Matches any primitive, `void`, `Date`, or `RegExp` value.
 */
export type BuiltIns = Primitive | void | Date | RegExp;

/**
 * Matches any non-primitive object
 */
export type AtomicObject = Function | Promise<any> | Date | RegExp;

/** Determines if the passed value is of a specific type */
export type TypeTester = (value: any) => boolean;

/**
 * The interface for a type mapping (key =\> function) to use for {@link getType}.
 * export * The key represents the name of the type. The function represents the {@link TypeTester | test method}.
 * The map should be ordered by testing preference, with more specific tests first.
 * If a test returns true, it is selected, and the key is returned as the type.
 */
export type TypeMap = Record<string, TypeTester>;

declare const emptyObjectSymbol: unique symbol;

export type FunctionOrValue<Value> = Value extends () => infer X ? X : Value;

/**
 * A [[List]]
 *
 * @example
 * ```ts
 * type list0 = [1, 2, 3]
 * type list1 = number[]
 * ```
 *
 * @param A - its type
 * @returns [[List]]
 */
export type List<A = any> = ReadonlyArray<A>;

/**
 * Alias to create a [[Function]]
 *
 * @example
 * ```ts
 * import { FunctionLike } from '@storm-stack/types'
 *
 * type test0 = FunctionLike<[string, number], boolean>
 * /// (args_0: string, args_1: number) => boolean
 * ```
 *
 * @param P - parameters
 * @param R - return type
 * @returns [[Function]]
 */
export type FunctionLike<P extends List = any, R extends any = any> = (
  ...args: P
) => R;

export type AnyFunction = FunctionLike<any, any>;
export type Nullish = undefined | null;
export type Nullishable<T> = T | Nullish;
export type NonNullishObject = object; // not null/undefined which are Object
export type NativeClass = abstract new (...args: any) => any;
export type AnyNumber = number | number;
export type AnyString = string | string;
export type AnyBoolean = boolean | boolean;
export type AnyArray = any[];
export type PlainObject = Record<any, object>; // https://stackoverflow.com/a/75052315/130638
export type AnyMap = Map<any, any>;
export type AnyWeakMap = WeakMap<WeakKey, any>;
export type EmptyArray = [];
export interface EmptyObject {
  [emptyObjectSymbol]?: never;
}

export type Any =
  | boolean
  | number
  | bigint
  | string
  | null
  | undefined
  | void
  | symbol
  | object
  | PlainObject
  | AnyArray
  | AnyMap
  | AnyWeakMap;

/**
 * The valid types of the index for an `Indexable` type object
 */
export type IndexType = string | number | symbol;

/**
 * The declaration of a ***dictionary-type*** object
 */
export type Indexable = Record<IndexType, any>;

export const EMPTY_STRING = "";
export const NEWLINE_STRING = "\r\n";
export const EMPTY_OBJECT = {};

export type AnyCase<T extends IndexType> = string extends T
  ? string
  : T extends `${infer F1}${infer F2}${infer R}`
    ? `${Uppercase<F1> | Lowercase<F1>}${Uppercase<F2> | Lowercase<F2>}${AnyCase<R>}`
    : T extends `${infer F}${infer R}`
      ? `${Uppercase<F> | Lowercase<F>}${AnyCase<R>}`
      : typeof EMPTY_STRING;

export type Newable<T> = new (..._args: never[]) => T;

export interface Abstract<T> {
  prototype: T;
}

export interface Clonable<T> {
  clone(): T;
}

export type MaybePromise<T> = T | Promise<T>;

export type ReducerFunction<TState, TAction> = (
  state: TState,
  action: TAction
) => TState;

// NOTE: for the file size optimization
export const TYPE_ARGUMENTS = "Arguments";
export const TYPE_ARRAY = "Array";
export const TYPE_OBJECT = "Object";
export const TYPE_MAP = "Map";
export const TYPE_SET = "Set";

export type Collection =
  | IArguments
  | unknown[]
  | Map<unknown, unknown>
  | Record<string | number | symbol, unknown>
  | Set<unknown>;

export type NonUndefined<T> = T extends undefined ? never : T;

export type BrowserNativeObject = Date | File;

export type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
  ? T
  : {
      [K in keyof T]?: DeepPartial<T[K]>;
    };

export type Rollback = Record<
  string,
  (initialValue: any, currentValue: any) => any
>;

/**
 * Extract all required keys from the given type.
 *
 * @remarks This is useful when you want to create a new type that contains different type values for the required keys only or use the list of keys for validation purposes, etc...
 * @category Utilities
 */
export type RequiredKeysOf<BaseType extends object> = Exclude<
  {
    [Key in keyof BaseType]: BaseType extends Record<Key, BaseType[Key]>
      ? Key
      : never;
  }[keyof BaseType],
  undefined
>;

/**
 * Returns a boolean for whether the two given types are equal.
 *
 * @remarks Use-cases: If you want to make a conditional branch based on the result of a comparison of two types.
 * @link https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
 * @link https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796
 * @category Type Guard
 * @category Utilities
 */
export type IsEqual<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
    ? true
    : false;

export type Filter<KeyType, ExcludeType> =
  IsEqual<KeyType, ExcludeType> extends true
    ? never
    : KeyType extends ExcludeType
      ? never
      : KeyType;

interface ExceptOptions {
  /**
    Disallow assigning non-specified properties.

    Note that any omitted properties in the resulting type will be present in autocomplete as `undefined`.

    @defaultValue  false
    */
  requireExactProps?: boolean;
}

/**
 * Create a type from an object type without certain keys.
 *
 * @remarks We recommend setting the `requireExactProps` option to `true`.
 * @remarks This type is a stricter version of [`Omit`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type). The `Omit` type does not restrict the omitted keys to be keys present on the given type, while `Except` does. The benefits of a stricter type are avoiding typos and allowing the compiler to pick up on rename refactors automatically.
 * @remarks This type was proposed to the TypeScript team, which declined it, saying they prefer that libraries implement stricter versions of the built-in types ([microsoft/TypeScript#30825](https://github.com/microsoft/TypeScript/issues/30825#issuecomment-523668235)).
 * @category Object
 */
export type Except<
  ObjectType,
  KeysType extends keyof ObjectType,
  Options extends ExceptOptions = { requireExactProps: false }
> = {
  [KeyType in keyof ObjectType as Filter<
    KeyType,
    KeysType
  >]: ObjectType[KeyType];
} & (Options["requireExactProps"] extends true
  ? Partial<Record<KeysType, never>>
  : Record<string, never>);

/**
 * Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
 *
 * @remarks Sometimes it is desired to pass a value as a function argument that has a different type. At first inspection it may seem assignable, and then you discover it is not because the `value`'s type definition was defined as an interface. In the following example, `fn` requires an argument of type `Record<string, unknown>`. If the value is defined as a literal, then it is assignable. And if the `value` is defined as type using the `Simplify` utility the value is assignable.  But if the `value` is defined as an interface, it is not assignable because the interface is not sealed and elsewhere a non-string property could be added to the interface.
 * @remarks If the type definition must be an interface (perhaps it was defined in a third-party npm package), then the `value` can be defined as `const value: Simplify<SomeInterface> = ...`. Then `value` will be assignable to the `fn` argument.  Or the `value` can be cast as `Simplify<SomeInterface>` if you can't re-declare the `value`.
 * @link https://github.com/microsoft/TypeScript/issues/15300
 * @category Object
 */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

/**
 * Create a type that makes the given keys required. The remaining keys are kept as is. The sister of the `SetOptional` type.
 *
 * @remarks Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are required.
 * @category Object
 */
export type SetRequired<
  BaseType,
  Keys extends keyof BaseType
> = BaseType extends unknown // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types). // union into a [distributive conditional // `extends unknown` is always going to be the case and is used to convert any
  ? Simplify<
      // Pick just the keys that are optional from the base type.
      Except<BaseType, Keys> &
        // Pick the keys that should be required from the base type and make them required.
        Required<Pick<BaseType, Keys>>
    >
  : never;

export const $NestedValue: unique symbol = Symbol("NestedValue");

export type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never;
} & TValue;

export interface RefObject<T> {
  current: T;
}

export interface IIdentity<T = string> {
  id: T;
}

export interface IVersioned {
  version: number;
}

export interface ISequenced {
  /**
   * The sequence number (version, or event counter, etc.) of the record
   */
  sequence: number;
}

export interface ITyped {
  /**
   * The type of the record
   */
  __typename: string;
}

export interface ClassTypeCheckable<T> extends ITyped {
  /**
   * Run type check on the given value
   * @param value - The value to check
   * @returns True if the value is of the type of the class
   */
  isTypeOf: (value: unknown) => value is T;
}

/**
 * Matches non-recursive types.
 */
export type NonRecursiveType =
  | BuiltIns
  | Function
  | (new (...arguments_: any[]) => unknown);

export type IsPrimitive<T> = [T] extends [Primitive] ? true : false;
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsNull<T> = [T] extends [null] ? true : false;
export type IsUndefined<T> = T extends undefined ? true : false;
export type IsUnknown<T> = unknown extends T // `T` can be `unknown` or `any`
  ? IsNull<T> extends false // `any` can be `null`, but `unknown` can't be
    ? true
    : false
  : false;
export type IsNullish<T> = IsNull<T> & IsUndefined<T>;
export type IsFunction<T> = T extends AnyFunction ? true : false;

/**
 * Declare locally scoped properties on `globalThis`.
 *
 * When defining a global variable in a declaration file is inappropriate, it can be helpful to define a `type` or `interface` (say `ExtraGlobals`) with the global variable and then cast `globalThis` via code like `globalThis as unknown as ExtraGlobals`.
 *
 * Instead of casting through `unknown`, you can update your `type` or `interface` to extend `GlobalThis` and then directly cast `globalThis`.
 *
 * @example
 * ```
 * import type {GlobalThis} from 'type-fest';
 *
 * type ExtraGlobals = GlobalThis & {
 *   readonly GLOBAL_TOKEN: string;
 * };
 *
 * (globalThis as ExtraGlobals).GLOBAL_TOKEN;
 * ```
 *
 * @category Type
 */
export type GlobalThis = typeof globalThis;

/**
 * Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
 *
 * @category Class
 */
export interface Class<T, Arguments extends unknown[] = any[]> {
  prototype: Pick<T, keyof T>;
  new (...arguments_: Arguments): T;
}

/**
 * Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
 *
 * @category Class
 */
export type Constructor<T, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T;

/**
 * Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/classes.html#abstract-classes).
 *
 * @category Class
 *
 * @privateRemarks
 * We cannot use a `type` here because TypeScript throws: 'abstract' modifier cannot appear on a type member. (1070)
 */

export interface AbstractClass<T, Arguments extends unknown[] = any[]>
  extends AbstractConstructor<T, Arguments> {
  prototype: Pick<T, keyof T>;
}

/**
 * Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-2.html#abstract-construct-signatures) constructor.
 *
 * @category Class
 */
export type AbstractConstructor<
  T,
  Arguments extends unknown[] = any[]
> = abstract new (...arguments_: Arguments) => T;

/**
 * Create a tuple type of the given length `<L>` and fill it with the given type `<Fill>`.
 *
 * If `<Fill>` is not provided, it will default to `unknown`.
 *
 * @link https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
 */
export type BuildTuple<
  L extends number,
  Fill = unknown,
  T extends readonly unknown[] = []
> = T["length"] extends L ? T : BuildTuple<L, Fill, [...T, Fill]>;

/**
 * Test if the given function has multiple call signatures.
 *
 * Needed to handle the case of a single call signature with properties.
 *
 * Multiple call signatures cannot currently be supported due to a TypeScript limitation.
 * @see https://github.com/microsoft/TypeScript/issues/29732
 */
export type HasMultipleCallSignatures<
  T extends (...arguments_: any[]) => unknown
> = T extends {
  (...arguments_: infer A): unknown;
  (...arguments_: infer B): unknown;
}
  ? B extends A
    ? A extends B
      ? false
      : true
    : true
  : false;

type StructuredCloneablePrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | boolean
  | number
  | string;

type StructuredCloneableData =
  | ArrayBuffer
  | DataView
  | Date
  | Error
  | RegExp
  | TypedArray
  | Blob
  | File;
// DOM exclusive types
// | AudioData
// | CropTarget
// | CryptoKey
// | DOMException
// | DOMMatrix
// | DOMMatrixReadOnly
// | DOMPoint
// | DOMPointReadOnly
// | DOMQuad
// | DOMRect
// | DOMRectReadOnly
// | FileList
// | FileSystemDirectoryHandle
// | FileSystemFileHandle
// | FileSystemHandle
// | GPUCompilationInfo
// | GPUCompilationMessage
// | ImageBitmap
// | ImageData
// | RTCCertificate
// | VideoFrame

type StructuredCloneableCollection =
  | readonly StructuredCloneable[]
  | {
      readonly [key: string]: StructuredCloneable;
      readonly [key: number]: StructuredCloneable;
    }
  | ReadonlyMap<StructuredCloneable, StructuredCloneable>
  | ReadonlySet<StructuredCloneable>;

/**
 * Matches a value that can be losslessly cloned using `structuredClone`.
 *
 * Note:
 * - Custom error types will be cloned as the base `Error` type
 * - This type doesn't include types exclusive to the TypeScript DOM library (e.g. `DOMRect` and `VideoFrame`)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 *
 * @example
 * ```
 * import type {StructuredCloneable} from 'type-fest';
 *
 * class CustomClass {}
 *
 * // @ts-expect-error
 * const error: StructuredCloneable = {
 *     custom: new CustomClass(),
 * };
 *
 * structuredClone(error);
 * //=> {custom: {}}
 *
 * const good: StructuredCloneable = {
 *     number: 3,
 *     date: new Date(),
 *     map: new Map<string, number>(),
 * }
 *
 * good.map.set('key', 1);
 *
 * structuredClone(good);
 * //=> {number: 3, date: Date(2022-10-17 22:22:35.920), map: Map {'key' -> 1}}
 * ```
 *
 * @category Structured clone
 */
export type StructuredCloneable =
  | StructuredCloneablePrimitive
  | StructuredCloneableData
  | StructuredCloneableCollection;
