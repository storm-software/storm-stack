import { noop } from "@storm-stack/utilities";
import { atom } from "jotai/vanilla";

const pendingPromise = new Promise<never>(noop);

/**
 * Creates an atom that always returns a pending promise.
 *
 * @returns An atom that always returns a pending promise.
 */
export const atomWithPending = <Value>() =>
  atom(pendingPromise as unknown as Value);
