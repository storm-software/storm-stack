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

export type MessageType = "error" | "info" | "success" | "warning";
// eslint-disable-next-line no-redeclare
export const MessageType = {
  ERROR: "error" as MessageType,
  INFO: "info" as MessageType,
  SUCCESS: "success" as MessageType,
  WARNING: "warning" as MessageType
};

export type MessageDetails<TMessageType extends string = MessageType> =
  | {
      code: string;
      message?: string;
      type: TMessageType;
    }
  | {
      code?: string;
      message: string;
      type: TMessageType;
    };

export type ErrorMessageDetails = {
  type: "error";
} & Omit<MessageDetails, "type">;
export type WarningMessageDetails = {
  type: "warning";
} & Omit<MessageDetails, "type">;
export type InfoMessageDetails = {
  type: "info";
} & Omit<MessageDetails, "type">;
export type SuccessMessageDetails = {
  type: "success";
} & Omit<MessageDetails, "type">;
