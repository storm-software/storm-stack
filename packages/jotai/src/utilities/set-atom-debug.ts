import { isDevelopment } from "@storm-stack/utilities";
import type { Atom } from "jotai/vanilla";

/**
 * Add a debug label to the Jotai Atom
 *
 * @param atom - The atom to apply the debug label to
 * @param label - The label to apply to the atom
 */
export const setAtomDebugLabel = (atom: Atom<unknown>, label: string) => {
  if (isDevelopment()) {
    atom.debugLabel = label;
  }
};

/**
 * Mark the atom as a *private* or internal
 *
 * @param atom - The atom to mark as private
 */
export const setAtomPrivate = (atom: Atom<unknown>) => {
  if (isDevelopment()) {
    atom.debugPrivate = true;
  }
};
