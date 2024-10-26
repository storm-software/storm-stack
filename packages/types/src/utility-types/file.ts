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

export type FileStatus =
  | "loading"
  | "validating"
  | "uploading"
  | "failed"
  | "completed";
export type FileVirusScanStatus = "pending" | "failed" | "success";

/**
 * A type that representing a file object.
 */
export type FileResult = {
  name: string;
  status: FileStatus;
  virusScan: FileVirusScanStatus;
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
