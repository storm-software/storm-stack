import { isFunction, isSetObject } from "@storm-stack/utilities";
import { Atom, WritableAtom } from "jotai";

export const isAtom = <TValue = any>(value: unknown): value is Atom<TValue> =>
  isSetObject(value) && "read" in value && isFunction(value.read);

export const isWritableAtom = <
  TValue = any,
  TArgs extends unknown[] = unknown[],
  TResult = any
>(
  value: unknown
): value is WritableAtom<TValue, TArgs, TResult> =>
  isAtom(value) && "write" in value && isFunction(value.write);
