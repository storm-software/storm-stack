import { SelectOption } from "../types";
import { isEmpty } from "./is-empty";

/**
 * Check if the provided value's type is SelectOption
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is of type SelectOption
 */
export const isSelectOption = (value: unknown): value is SelectOption => {
  try {
    return (
      !isEmpty((value as SelectOption)?.name) &&
      "value" in (value as SelectOption)
    );
  } catch (e) {
    return false;
  }
};
