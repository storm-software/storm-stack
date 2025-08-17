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

import { getColors as getColorsBase } from "@storm-software/config-tools/utilities/colors";
import { Colors } from "@storm-software/config/types";
import { CLIPluginContext } from "../types/config";

/**
 * Gets the color configuration for the CLI plugin.
 *
 * @param context - The CLI plugin context.
 * @returns The color configuration.
 *
 * @remarks
 * This function retrieves the color configuration from the plugin options, allowing for customization of colors in the CLI application.
 */
export function getColors(context: CLIPluginContext): Colors {
  return getColorsBase(context.options);
}
