/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { SerializedTypes } from "@deepkit/type";
import type { ResolvedEntryTypeDefinition } from "@storm-stack/core/types";

export type CommandEntryTypeDefinition = ResolvedEntryTypeDefinition &
  Required<Pick<ResolvedEntryTypeDefinition, "output">> & {
    displayName?: string;
    description?: string;
    path: string[];
    isVirtual: boolean;
  };

export interface CommandRelationsReflection {
  parent?: string;
  children: string[];
}

export interface CommandPayloadArgReflection {
  name: string;
  displayName: string;
  description?: string;
  aliases: string[];
  type: string;
  stringifiedType: string;
  reflectionType: SerializedTypes;
  options?: string[] | number[];
  array: boolean;
  required: boolean;
  default?: any;
  isNegative?: boolean;
}

export interface CommandPayloadReflection {
  name: string;
  importPath?: string;
  args: CommandPayloadArgReflection[];
}

export interface CommandReflection {
  commandId: string;
  name: string;
  displayName: string;
  description?: string;
  aliases: string[];
  entry: CommandEntryTypeDefinition;
  payload: CommandPayloadReflection;
  relations: CommandRelationsReflection;
}

export type CommandReflectionTree = Omit<
  CommandReflection,
  "commandId" | "relations" | "payload"
> & {
  parent: null;
  children: Record<string, CommandReflectionTreeBranch>;
};

export type CommandReflectionTreeBranch = Omit<
  CommandReflection,
  "relations"
> & {
  parent: CommandReflectionTree | CommandReflectionTreeBranch;
  children: Record<string, CommandReflectionTreeBranch>;
};
