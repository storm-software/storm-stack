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

import { ResolvedEntryTypeDefinition } from "@storm-stack/core/types/build";
import { Command } from "../data/command";

export type CommandEntryTypeDefinition = ResolvedEntryTypeDefinition &
  Required<Pick<ResolvedEntryTypeDefinition, "output">> & {
    title?: string;
    description?: string;
    path: string[];
    isVirtual: boolean;
  };

export interface CommandTreeItem {
  parent: null | CommandTreeItem;
  children: Record<string, CommandTreeBranch>;
}

export interface CommandTree extends CommandTreeItem {
  name: string;
  title: string;
  bin: string[];
  entry: CommandEntryTypeDefinition;
  description?: string;
  parent: null;
}

export interface CommandTreeBranch extends CommandTreeItem {
  command: Command;
  parent: CommandTree | CommandTreeBranch;
  root: CommandTree;
}

export interface CommandRelations {
  parent: string | null;
  children: string[];
}
