/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { StormError } from "storm:error";

export function getCity(request: StormRequest<ExampleRequest>) {
  const request = request.data;
  if (!request) {
    // This error message should be replaced by the compiler
    return new StormError(`No request found in ${request.id} request`);
  }

  $storm.log.info("Getting city from request");

  return request.address.city;
}
