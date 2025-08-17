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

import { generateCapnp } from "@storm-stack/devkit/templates/helpers/capnp";
import { readConfigTypeReflection } from "@storm-stack/plugin-config/helpers/persistence";
import { NodeConfigPluginContext } from "../types";

export async function generateSchema(context: NodeConfigPluginContext) {
  const reflection = await readConfigTypeReflection(context);
  if (!reflection) {
    throw new Error("No schema reflection found in context.");
  }

  return generateCapnp(context, reflection, { name: "ConfigSchema" });
}
