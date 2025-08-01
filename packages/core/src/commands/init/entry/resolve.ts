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

import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { hash } from "@stryke/hash/hash";
import { joinPaths } from "@stryke/path/join-paths";
import type {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import type { Context } from "../../../types/context";

export function resolveEntry(
  options: Context,
  entry: TypeDefinitionParameter
): TypeDefinition {
  const parsed = parseTypeDefinition(entry)!;
  const entryFile = parsed.file
    .replace(options.options.projectRoot, "")
    .replaceAll("\\", "/")
    .replaceAll(/^(?:\.\/)*/g, "");

  return {
    file: joinPaths(
      options.artifactsPath,
      `entry-${hash({ file: entryFile, name: parsed.name }, { maxLength: 24 }).replaceAll("-", "0").replaceAll("_", "1")}.ts`
    ),
    name: parsed.name
  };
}
