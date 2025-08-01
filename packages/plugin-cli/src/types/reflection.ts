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

import { ReflectionFunction } from "@deepkit/type";
import { ResolvedEntryTypeDefinition } from "@storm-stack/core/types/build";
import { CommandPayload } from "../data/command-payload";

export type CommandEntryTypeDefinition = ResolvedEntryTypeDefinition &
  Required<Pick<ResolvedEntryTypeDefinition, "output">> & {
    title?: string;
    description?: string;
    path: string[];
    isVirtual: boolean;
  };

export interface CommandTreeBranch {
  name: string;
  entry: CommandEntryTypeDefinition;
  parent: null | CommandTree | Command;
  children: Record<string, Command>;
}

export interface CommandTree extends CommandTreeBranch {
  title: string;
  bin: string[];
  description?: string;
  parent: null;
}

export interface Command extends CommandTreeBranch {
  id: string;
  title: string;
  type: ReflectionFunction;
  payload: CommandPayload;
  parent: CommandTree | Command;
  root: CommandTree;
}
