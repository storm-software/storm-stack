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

export const RFC_3339_DATE_TIME_REGEX =
  /(?<temp6>\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d\.\d+(?<temp5>[+-][0-2]\d:[0-5]\d|Z))|(?<temp4>\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d(?<temp3>[+-][0-2]\d:[0-5]\d|Z))|(?<temp2>\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?<temp1>[+-][0-2]\d:[0-5]\d|Z))/;

export const RFC_3339_DATE_REGEX =
  /^(?<temp3>\d{4}-(?<temp2>0[1-9]|1[0-2])-(?<temp1>0[1-9]|[12]\d|3[01]))$/;

export const RFC_3339_TIME_REGEX =
  /^(?<temp8>[01]\d|2[0-3]):(?<temp7>[0-5]\d):(?<temp6>[0-5]\d)(?<temp5>\.\d+)?(?<temp4>(?<temp3>Z)|(?<temp2>[+|-](?<temp1>[01]\d|2[0-3]):[0-5]\d))$/;

export const DEFAULT_DATE_FORMAT = "M/D/YYYY";

export const DEFAULT_TIME_FORMAT = "h:mm A";

export const DEFAULT_DATE_TIME_FORMAT = `${DEFAULT_DATE_FORMAT} ${DEFAULT_TIME_FORMAT}`;
