/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs

 Contact:         https://stormsoftware.com/contact
 Licensing:       https://stormsoftware.com/projects/storm-stack/licensing

 -------------------------------------------------------------------*/

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
