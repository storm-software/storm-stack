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

import type { ResolvedEntryTypeDefinition } from "@storm-stack/core/types";

export interface CommandReflectionArg {
  name: string;
  displayName: string;
  description?: string;
  type: string;
  options?: string[] | number[];
  required: boolean;
  default?: any;
}

export interface CommandReflection {
  name: string;
  description?: string;
  displayName: string;
  entry: ResolvedEntryTypeDefinition;
  argsTypeName: string;
  argsTypeImport: string;
  args: CommandReflectionArg[];
  subCommands?: Record<string, CommandReflection>;
}
