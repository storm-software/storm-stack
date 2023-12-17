import { noop } from "@storm-stack/utilities";
import { atom } from "jotai/vanilla";

const pendingPromise = new Promise<never>(noop);

export const atomWithPending = <Value>() =>
  atom(pendingPromise as unknown as Value);
