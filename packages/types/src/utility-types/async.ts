import { IsUnknown } from "./base";

/**
 * Create a function type with a return type of your choice and the same parameters as the given function type.
 *
 * Use-case: You want to define a wrapped function that returns something different while receiving the same parameters. For example, you might want to wrap a function that can throw an error into one that will return `undefined` instead.
 *
 * @example
 * ```
 * import type {SetReturnType} from 'type-fest';
 *
 * type MyFunctionThatCanThrow = (foo: SomeType, bar: unknown) => SomeOtherType;
 *
 * type MyWrappedFunction = SetReturnType<MyFunctionThatCanThrow, SomeOtherType | undefined>;
 * //=> type MyWrappedFunction = (foo: SomeType, bar: unknown) => SomeOtherType | undefined;
 * ```
 *
 * @category Function
 */
export type SetReturnType<
  Function_ extends (...arguments_: any[]) => any,
  TypeToReturn
> =
  // Just using `Parameters<Fn>` isn't ideal because it doesn't handle the `this` fake parameter.
  Function_ extends (
    this: infer ThisArgument,
    ...arguments_: infer Arguments
  ) => any
    ? // If a function did not specify the `this` fake parameter, it will be inferred to `unknown`.
      // We want to detect this situation just to display a friendlier type upon hovering on an IntelliSense-powered IDE.
      IsUnknown<ThisArgument> extends true
      ? (...arguments_: Arguments) => TypeToReturn
      : (this: ThisArgument, ...arguments_: Arguments) => TypeToReturn
    : // This part should be unreachable, but we make it meaningful just in case…
      (...arguments_: Parameters<Function_>) => TypeToReturn;

export type AsyncFunction = (...arguments_: any[]) => Promise<unknown>;

/**
 * Unwrap the return type of a function that returns a `Promise`.
 *
 * There has been [discussion](https://github.com/microsoft/TypeScript/pull/35998) about implementing this type in TypeScript.
 *
 * @example
 * ```ts
 * import type {AsyncReturnType} from 'type-fest';
 * import {asyncFunction} from 'api';
 *
 * // This type resolves to the unwrapped return type of `asyncFunction`.
 * type Value = AsyncReturnType<typeof asyncFunction>;
 *
 * async function doSomething(value: Value) {}
 *
 * asyncFunction().then(value => doSomething(value));
 * ```
 *
 * @category Async
 */
export type AsyncReturnType<Target extends AsyncFunction> = Awaited<
  ReturnType<Target>
>;

/**
 * Create an async version of the given function type, by boxing the return type in `Promise` while keeping the same parameter types.
 *
 * Use-case: You have two functions, one synchronous and one asynchronous that do the same thing. Instead of having to duplicate the type definition, you can use `Asyncify` to reuse the synchronous type.
 *
 * @example
 * ```
 * import type {Asyncify} from 'type-fest';
 *
 * // Synchronous function.
 * function getFooSync(someArg: SomeType): Foo {
 * 	// …
 * }
 *
 * type AsyncifiedFooGetter = Asyncify<typeof getFooSync>;
 * //=> type AsyncifiedFooGetter = (someArg: SomeType) => Promise<Foo>;
 *
 * // Same as `getFooSync` but asynchronous.
 * const getFooAsync: AsyncifiedFooGetter = (someArg) => {
 * 	// TypeScript now knows that `someArg` is `SomeType` automatically.
 * 	// It also knows that this function must return `Promise<Foo>`.
 * 	// If you have `@typescript-eslint/promise-function-async` linter rule enabled, it will even report that "Functions that return promises must be async.".
 *
 * 	// …
 * }
 * ```
 *
 * @category Async
 */
export type Asyncify<Function_ extends (...arguments_: any[]) => any> =
  SetReturnType<Function_, Promise<Awaited<ReturnType<Function_>>>>;
