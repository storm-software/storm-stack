import { isFunction } from "@storm-stack/utilities";
import { Getter, Setter, WritableAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { AsyncStorage, SyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import { SetStateAction } from "react";
import { createWebStorage } from "../utilities/create-web-storage";
import { setAtomPrivate } from "../utilities/set-atom-debug";
import { atomWithBroadcast } from "./atom-with-broadcast";

const getWebStorage = <TValue>() =>
  createWebStorage<TValue>(() => localStorage);

/**
 * Creates an atom that persists its state in external storage and sends a broadcast message to other tabs/windows when the state changes.
 *
 * @param key - The key to use for the storage
 * @param initialValue - The initial value of the atom
 * @param webStorage - The storage to use
 * @returns An atom that persists its state in external storage and sends a broadcast message to other tabs/windows when the state changes.
 */
export function atomWithWebStorage<TValue = unknown>(
  key: string,
  initialValue: TValue,
  webStorage:
    | SyncStorage<TValue>
    | AsyncStorage<TValue> = getWebStorage<TValue>()
): WritableAtom<TValue, [SetStateAction<TValue>], void> {
  const baseAtom: WritableAtom<TValue, [SetStateAction<TValue>], void> =
    atomWithStorage(key, initialValue, webStorage as SyncStorage<TValue>);
  setAtomPrivate(baseAtom);

  const broadcastAtom = atomWithBroadcast<TValue>(key, initialValue);
  setAtomPrivate(broadcastAtom);

  const returnedAtom = atom<TValue, [SetStateAction<TValue>], void>(
    (get: Getter) => get(baseAtom),
    (get: Getter, set: Setter, update: SetStateAction<TValue>) => {
      let nextValue!: TValue;
      if (isFunction(update)) {
        nextValue = update(get(baseAtom)) as TValue;
      } else {
        nextValue = update as TValue;
      }

      set(baseAtom, nextValue);
      set(broadcastAtom, nextValue);
    }
  );

  return returnedAtom;
}
