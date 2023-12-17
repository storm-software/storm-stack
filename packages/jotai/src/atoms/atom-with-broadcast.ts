import { parse, stringify } from "@storm-stack/serialization";
import { isRuntimeServer } from "@storm-stack/utilities";
import { atom } from "jotai/vanilla";
import { setAtomPrivate } from "../utilities/set-atom-debug";

/**
 * Creates an atom that broadcasts its value to other tabs/windows using the BroadcastChannel API.
 *
 * @param key - The key to use for the BroadcastChannel
 * @param initialValue - The initial value of the atom
 * @returns An atom that broadcasts its value to other tabs/windows using the BroadcastChannel API.
 */
export function atomWithBroadcast<TValue>(key: string, initialValue: TValue) {
  const baseAtom = atom(initialValue);
  setAtomPrivate(baseAtom);

  const listeners = new Set<(event: MessageEvent<any>) => void>();

  const channel = !isRuntimeServer() ? new BroadcastChannel(key) : null;
  if (channel) {
    channel.onmessage = event => {
      listeners.forEach(listener => listener(event));
    };
  }

  const broadcastAtom = atom<
    TValue,
    [{ isEvent: boolean; value: TValue }],
    void
  >(
    get => get(baseAtom),
    (get, set, update: { isEvent: boolean; value: TValue }) => {
      set(baseAtom, update.value);

      if (!update.isEvent && !isRuntimeServer() && channel) {
        channel.postMessage(stringify(get(baseAtom)));
      }
    }
  );
  broadcastAtom.onMount = setAtom => {
    const listener = (event: MessageEvent<any>) => {
      setAtom({ isEvent: true, value: parse(event.data) });
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  setAtomPrivate(broadcastAtom);

  const returnedAtom = atom<TValue, [TValue], void>(
    get => get(broadcastAtom),
    (get, set, update: TValue) => {
      set(broadcastAtom, { isEvent: false, value: update });
    }
  );

  return returnedAtom;
}
