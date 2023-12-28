import { useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  SimpleWritableAtomRecord,
  UseSyncAtoms
} from "../utilities/create-atom-store";

/**
 * Update atoms with new values on changes.
 */
export const useSyncStore = (
  atoms: SimpleWritableAtomRecord<any>,
  values: any,
  { store }: Parameters<UseSyncAtoms<any>>[1] = {}
) => {
  for (const key of Object.keys(atoms)) {
    const value = values[key];
    const set = useSetAtom(atoms[key]!, { store });

    useEffect(() => {
      if (value !== undefined && value !== null) {
        set(value);
      }
    }, [set, value]);
  }
};
