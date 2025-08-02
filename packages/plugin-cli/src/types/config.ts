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

import { WorkspaceConfig } from "@storm-stack/core/types/config";
import { Context } from "@storm-stack/core/types/context";
import {
  NodePluginConfig,
  NodePluginContextOptions
} from "@storm-stack/plugin-node/types";
import { CommandEntryTypeDefinition } from "./reflection";

export interface CLIPluginConfig extends NodePluginConfig {
  /**
   * The name of the binary that will be generated to run the CLI
   */
  bin?: string | string[];

  /**
   * The lowest Node.js version that the CLI will support.
   *
   * @defaultValue 20
   */
  minNodeVersion?: 22 | 20 | 18 | 16;

  /**
   * If a boolean, this will be used to determine the default value of the `interactive` flag. If `never` is specified, the CLI will not include an interactive mode.
   */
  interactive?: boolean | "never";

  /**
   * The author/organization that developed or maintains the CLI application
   *
   * @remarks
   * This can be a string or an object with `name`, `email`, and `url` properties. If this option is not provided, the preset will try to use the \`author.name\` or \`contributors.name\` value from the `\package.json\` file. If not found in the `package.json`, it will try to find it in {@link WorkspaceConfig.organization}.
   */
  author?: WorkspaceConfig["organization"];

  /**
   * Should the config commands be added to the CLI?
   *
   * @remarks
   * This will add the `config` commands to the CLI that will allow you to view and edit the configuration state.
   *
   * @defaultValue true
   */
  manageConfig?: boolean;
}

export interface CLIPluginContextOptions extends NodePluginContextOptions {
  cli: Required<Omit<CLIPluginConfig, "dotenv" | "error" | "logs" | "author">> &
    Pick<CLIPluginConfig, "author">;
}

export type CLIPluginContext = Context<
  CLIPluginContextOptions,
  CommandEntryTypeDefinition
>;
