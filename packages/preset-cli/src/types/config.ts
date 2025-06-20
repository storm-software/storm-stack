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

import type { OrganizationConfig } from "@storm-software/config/types";

export interface StormStackCLIPresetConfig {
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
   * The homepage URL for the CLI application (this is used for the help command)
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`homepage\` value from the `\storm-workspace.json\` configuration or the \`homepage\`, \`author.url\`, or \`contributors.url\` value from the `\package.json\` file.
   */
  homepage?: string;

  /**
   * The documentation website URL for the CLI application (this is used for the help command)
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`docs\` value from the `\storm-workspace.json\` configuration or the \`docs\` value from the `\package.json\` file.
   */
  docs?: string;

  /**
   * The support website URL for the CLI application (this is used for the help command)
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`support\` value from the `\storm-workspace.json\` configuration or the \`bugs.url\` value from the `\package.json\` file.
   */
  support?: string;

  /**
   * The contact website URL for the CLI application (this is used for the help command)
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`contact\` value from the `\storm-workspace.json\` configuration or the \`author.url\` or \`contributors.url\` value from the `\package.json\` file.
   */
  contact?: string;

  /**
   * The author/organization that developed or maintains the CLI application
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`author.name\` or \`contributors.name\` value from the `\package.json\` file.
   */
  author?: OrganizationConfig | string;

  /**
   * The repository URL for the CLI application (this is used for the help command)
   *
   * @remarks
   * If this option is not provided, the preset will try to use the \`repository\` value from the `\storm-workspace.json\` configuration or the \`repository.url\` value from the `\package.json\` file.
   */
  repository?: string;

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
