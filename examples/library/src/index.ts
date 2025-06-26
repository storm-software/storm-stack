/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

// eslint-disable-next-line ts/consistent-type-imports
import { StormError } from "../.storm/runtime/error";
import { StormPayload } from "../.storm/runtime/payload";
import { ExamplePayload } from "./types";

export function getCity(request: StormPayload<ExamplePayload>) {
  const payload = request.data;
  if (!payload) {
    // This error message should be replaced by the compiler
    return new StormError(`No payload found in ${request.id} request`);
  }

  $storm.log.info("Getting city from payload");

  return payload.address.city;
}
