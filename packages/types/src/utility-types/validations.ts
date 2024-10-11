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

import { MessageDetails, MessageType } from "./messages";

export type ValidationDetails<
  TMessageType extends
    | typeof MessageType.ERROR
    | typeof MessageType.WARNING
    | typeof MessageType.INFO
    | typeof MessageType.HELP
    | typeof MessageType.SUCCESS =
    | typeof MessageType.ERROR
    | typeof MessageType.WARNING
    | typeof MessageType.INFO
    | typeof MessageType.HELP
    | typeof MessageType.SUCCESS
> = MessageDetails<TMessageType> & {
  /**
   * The field that the message is related to.
   *
   * @remarks
   * If `null`, the message is not related to a specific field - in this case it is likely a global/form message.
   */
  field: string | null;
};

export type ErrorValidationDetails = ValidationDetails<
  typeof MessageType.ERROR
>;
export type WarningValidationDetails = ValidationDetails<
  typeof MessageType.WARNING
>;
export type InfoValidationDetails = ValidationDetails<typeof MessageType.INFO>;
export type HelpValidationDetails = ValidationDetails<typeof MessageType.HELP>;
export type SuccessValidationDetails = ValidationDetails<
  typeof MessageType.SUCCESS
>;
