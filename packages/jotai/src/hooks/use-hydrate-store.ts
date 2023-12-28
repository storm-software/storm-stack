import { useHydrateAtoms } from "jotai/utils";
import {
  SimpleWritableAtomRecord,
  UseHydrateAtoms
} from "../utilities/create-atom-store";

/**
 * Hydrate atoms with initial values for SSR.
 */
export const useHydrateStore = (
  atoms: SimpleWritableAtomRecord<any>,
  initialValues: Parameters<UseHydrateAtoms<any>>[0],
  options: Parameters<UseHydrateAtoms<any>>[1] = {}
) => {
  const values: any[] = [];

  for (const key of Object.keys(atoms)) {
    const initialValue = initialValues[key];

    if (initialValue !== undefined) {
      values.push([atoms[key], initialValue]);
    }
  }

  useHydrateAtoms(values, options);
};
