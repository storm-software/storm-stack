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
import { findWorkspaceRoot } from "nx/src/utils/find-workspace-root.js";

/**
 * Get the workspace root path
 *
 * @returns The workspace root path
 */
export const getWorkspaceRoot = () => {
  if (
    !process.env.STORM_WORKSPACE_ROOT &&
    !process.env.NX_WORKSPACE_ROOT_PATH
  ) {
    const config = createStormConfig();
    if (config?.workspaceRoot) {
      return config.workspaceRoot;
    }

    const root = findWorkspaceRoot(process.cwd());
    return root?.dir;
  }

  return process.env.STORM_WORKSPACE_ROOT || process.env.NX_WORKSPACE_ROOT_PATH;
};
