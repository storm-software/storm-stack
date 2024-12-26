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

import { ValidationDetails } from "./validations";

export type FileStatus = "initialized" | "validated" | "uploaded" | "failed";
export const FileStatus = {
  INITIALIZED: "initialized" as FileStatus,
  VALIDATED: "validated" as FileStatus,
  UPLOADED: "uploaded" as FileStatus,
  FAILED: "failed" as FileStatus
};

/**
 * A type that representing a file object.
 */
export type FileResult = {
  name: string;
  status: FileStatus;
  issues?: ValidationDetails[];
  size?: number;
  mimeType?: string;
  lastModified?: number;
} & (
  | {
      uri: string;
      file?: File;
    }
  | {
      uri?: string;
      file: File;
    }
);
