import { isNonNullObject } from "./is-non-null-object";
import { isReactElement } from "./is-react-element";

const isSpecialType = (value: any) => {
  const stringValue = Object.prototype.toString.call(value);

  return (
    stringValue === "[object RegExp]" ||
    stringValue === "[object Date]" ||
    isReactElement(value)
  );
};

export const isMergeableObject = (value: any): boolean => {
  return isNonNullObject(value) && !isSpecialType(value);
};
