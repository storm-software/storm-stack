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

import type { ResolvedEntryTypeDefinition } from "@storm-stack/core/types";

export interface CommandReflectionArg {
  name: string;
  displayName: string;
  description?: string;
  type: string;
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
