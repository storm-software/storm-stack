/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { createStormConfig } from "@storm-software/config-tools";
import typia from "typia";
import { WorkspaceConfig } from "../types";

/**
 * Get the workspace configuration
 *
 * @returns The workspace configuration
 */
export const getWorkspaceConfig = (): WorkspaceConfig => {
  const stormConfig = createStormConfig();

  return typia.assert<WorkspaceConfig>(stormConfig);
};
