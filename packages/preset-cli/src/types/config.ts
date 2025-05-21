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

export interface StormStackCLIPresetConfig {
  /**
   * The name of the binary that will be generated to run the CLI
   */
  bin?: string | string[];

  /**
   * If a boolean, this will be used to determine the default value of the `interactive` flag. If `never` is specified, the CLI will not include an interactive mode.
   */
  interactive?: boolean | "never";

  /**
   * The homepage URL of the CLI application (this is used for the help command)
   */
  homepage?: string;

  /**
   * The documentation website URL of the CLI application (this is used for the help command)
   */
  docs?: string;
}
