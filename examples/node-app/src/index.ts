/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { ExamplePayload } from "./types";

export function getCity(request: StormRequest<ExamplePayload>) {
  const payload = request.data;
  if (!payload) {
    // This error message should be replaced by the Babel plugin
    return new StormError("No payload found");
  }

  $storm.log.info("Getting city from payload");

  return payload.address.city;
}
