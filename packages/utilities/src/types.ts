/**
 * The valid types of the index for an `Indexable` type object
 */
export type IndexType = string | number | symbol;

/**
 * The declaration of a ***dictionary-type*** object
 */
export type Indexable = {
  [index: IndexType]: any;
};

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

export type ReducerFunction<TState, TAction> = (state: TState, action: TAction) => TState;

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

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

/**
 * Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 *
 * @category Type
 */
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export type LiteralUnion<T extends U, U extends Primitive> =
  | T
  | (U & {
      _?: never;
    });

export type EmptyObject = {
  [K in string | number]: never;
};

export type NonUndefined<T> = T extends undefined ? never : T;

export type BrowserNativeObject = Date | FileList | File;

export type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
  ? T
  : {
      [K in keyof T]?: DeepPartial<T[K]>;
    };

export type Rollback = Record<string, (initialValue: any, currentValue: any) => any>;

/**
 * Extract all required keys from the given type.
 *
 * @remarks This is useful when you want to create a new type that contains different type values for the required keys only or use the list of keys for validation purposes, etc...
 * @category Utilities
 */
export type RequiredKeysOf<BaseType extends object> = Exclude<
  {
    [Key in keyof BaseType]: BaseType extends Record<Key, BaseType[Key]> ? Key : never;
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
export type IsEqual<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
  ? true
  : false;

export type Filter<KeyType, ExcludeType> = IsEqual<KeyType, ExcludeType> extends true
  ? never
  : KeyType extends ExcludeType
    ? never
    : KeyType;

type ExceptOptions = {
  /**
    Disallow assigning non-specified properties.

    Note that any omitted properties in the resulting type will be present in autocomplete as `undefined`.

    @default false
    */
  requireExactProps?: boolean;
};

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
  [KeyType in keyof ObjectType as Filter<KeyType, KeysType>]: ObjectType[KeyType];
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
} & (Options["requireExactProps"] extends true ? Partial<Record<KeysType, never>> : {});

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
export type SetRequired<BaseType, Keys extends keyof BaseType> = BaseType extends unknown // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types). // union into a [distributive conditional // `extends unknown` is always going to be the case and is used to convert any
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

export interface SelectOption {
  /**
   * 	The string value to display in the field
   */
  name: string;

  /**
   * The value stored behind the scenes when selected
   */
  value: string;

  /**
   * Is the option value valid for selection in the dropdown
   */
  disabled: boolean;

  /**
   * Sets or retrieves whether the option in the list box is the default item.
   */
  selected: boolean;
}

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
