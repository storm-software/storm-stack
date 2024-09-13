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

export const RFC_3339_DATETIME_REGEX =
  /^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d|60))(\.\d+)?((Z)|([+|-]([01]\d|2[0-3]):[0-5]\d))$/;

export const RFC_3339_DATE_REGEX =
  /^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;

export const RFC_3339_TIME_REGEX =
  /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d+)?((Z)|([+|-]([01]\d|2[0-3]):[0-5]\d))$/;
