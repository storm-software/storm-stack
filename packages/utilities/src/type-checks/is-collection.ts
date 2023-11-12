import { Collection } from "../types";
import typeDetect from "./type-detect";

const COLLECTION_TYPE_SET = new Set([
  "Arguments",
  "Array",
  "Map",
  "Object",
  "Set"
]);

/**
 * Check if the provided value's type is `Collection`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Collection`
 */
export function isCollection(value: any): value is Collection {
  return COLLECTION_TYPE_SET.has(typeDetect(value));
}
