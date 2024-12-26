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
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { FileResult, FileStatus } from "../utility-types/file";
import { isSetObject } from "./is-set-object";
import { isSetString } from "./is-set-string";

/**
 * Check if the provided value is a `FileResult` object
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is a `FileResult` object
 */
export const isFileResult = (value: any): value is FileResult => {
  return (
    isSetObject(value) &&
    "status" in value &&
    Object.values(FileStatus).includes(value.status as FileStatus) &&
    (isSetString((value as FileResult)?.uri) ||
      isSetObject((value as FileResult)?.file))
  );
};
