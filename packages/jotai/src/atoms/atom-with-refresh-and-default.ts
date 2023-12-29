import { atom, Getter, PrimitiveAtom } from "jotai";
import { setAtomPrivate } from "../utilities/set-atom-debug";

export const atomWithRefreshAndDefault = <TValue extends unknown>(
  refreshAtom: PrimitiveAtom<number>,
  getDefault: (get: Getter) => TValue
) => {
  const overwrittenAtom = atom<{ refresh: number; value: TValue } | null>(null);
  setAtomPrivate(overwrittenAtom);

  return atom(
    get => {
      const lastState = get(overwrittenAtom);
      if (lastState && lastState.refresh === get(refreshAtom)) {
        return lastState.value;
      }
      return getDefault(get);
    },
    (get, set, update: TValue) => {
      set(overwrittenAtom, { refresh: get(refreshAtom), value: update });
    }
  );
};
