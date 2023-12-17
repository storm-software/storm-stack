import { isFunction } from "./is-function";
import { isObject } from "./is-object";

/**
 * Check if the provided value's type is a promise
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is of type a promise
 */
export const isPromise = (value: unknown): value is Promise<unknown> => {
  return isObject(value) && isFunction((value as Promise<unknown>)?.then);
};

/**
 * Check if the provided value's type is a promise-like
 *
 * @remarks
 * A promise-like is an object that has a `then` function
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is of type a promise-like
 */
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as any)?.then === "function";
