import { atom, Getter } from "jotai";
import { setAtomPrivate } from "../utilities/set-atom-debug";

export function atomWithRefresh<TValue>(fn: (get: Getter) => TValue) {
  const refreshCounter = atom(0);
  setAtomPrivate(refreshCounter);

  return atom(
    get => {
      get(refreshCounter);
      return fn(get);
    },
    (_, set) => set(refreshCounter, i => i + 1)
  );
}
