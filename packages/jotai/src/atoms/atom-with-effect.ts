import type { Getter, Setter } from "jotai/vanilla";
import { atom } from "jotai/vanilla";
import { setAtomPrivate } from "../utilities/set-atom-debug";

type CleanupFn = () => void;

export function atomEffect(
  effectFn: (get: Getter, set: Setter) => void | CleanupFn
) {
  const refAtom = atom(() => ({
    mounted: false,
    inProgress: 0,
    promise: undefined as Promise<void> | undefined,
    cleanup: undefined as CleanupFn | void
  }));
  setAtomPrivate(refAtom);

  const refreshAtom = atom(0);
  setAtomPrivate(refreshAtom);

  const initAtom = atom(null, (get, set, mounted: boolean) => {
    const ref = get(refAtom);
    if (mounted) {
      ref.mounted = true;
      set(refreshAtom, c => c + 1);
    } else {
      ref.cleanup?.();
      ref.cleanup = undefined;
      ref.mounted = false;
    }
  });
  initAtom.onMount = init => {
    init(true);
    return () => init(false);
  };
  setAtomPrivate(initAtom);

  const effectAtom = atom(
    (get, { setSelf }) => {
      get(refreshAtom);
      const ref = get(refAtom);
      if (!ref.mounted || ref.inProgress) {
        return ref.promise;
      }
      ++ref.inProgress;
      return (ref.promise = Promise.resolve().then(() => {
        try {
          if (!ref.mounted) return;
          ref.cleanup?.();
          ref.cleanup = effectFn(get, setSelf as Setter);
        } finally {
          --ref.inProgress;
          ref.promise = undefined;
        }
      }));
    },
    (get, set, ...args: Parameters<Setter>) => {
      const ref = get(refAtom);
      ++ref.inProgress;
      try {
        return set(...args);
      } finally {
        --ref.inProgress;
      }
    }
  );
  setAtomPrivate(effectAtom);

  return atom(get => {
    get(initAtom);
    get(effectAtom);
  });
}
