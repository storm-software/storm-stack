import { useSetAtom } from "jotai";
import {
  Getter,
  SetStateAction,
  Setter,
  WritableAtom,
  atom
} from "jotai/vanilla";
import { useEffect } from "react";
import { isAtom } from "../utilities/is-atom";
import { setAtomPrivate } from "../utilities/set-atom-debug";

export type Callback<Value> = (
  get: Getter,
  set: Setter,
  newVal: Value,
  prevVal: Value
) => void;

/**
 * Creates an atom that broadcasts its value to other tabs/windows using the BroadcastChannel API.
 *
 * @param key - The key to use for the BroadcastChannel
 * @param initialValue - The initial value of the atom
 * @returns An atom that broadcasts its value to other tabs/windows using the BroadcastChannel API.
 */
export function atomWithListeners<TValue>(
  initial: TValue | WritableAtom<TValue, any, any>
) {
  const baseAtom = isAtom(initial) ? initial : atom(initial);
  setAtomPrivate(baseAtom);

  const listenersAtom = atom(<Callback<TValue>[]>[]);
  setAtomPrivate(listenersAtom);

  const anAtom = atom(
    get => get(baseAtom),
    (get, set, arg: SetStateAction<TValue>) => {
      const prevVal = get(baseAtom);
      set(baseAtom, arg);

      const newVal = get(baseAtom);
      get(listenersAtom).forEach(callback => {
        callback(get, set, newVal, prevVal);
      });
    }
  );

  const useListener = (callback: Callback<TValue>) => {
    const setListeners = useSetAtom(listenersAtom);
    useEffect(() => {
      setListeners(prev => [...prev, callback]);
      return () =>
        setListeners(prev => {
          const index = prev.indexOf(callback);
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    }, [setListeners, callback]);
  };
  return [anAtom, useListener] as const;
}
