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

  return process.env.STORM_WORKSPACE_ROOT
    ? process.env.STORM_WORKSPACE_ROOT
    : process.env.NX_WORKSPACE_ROOT_PATH;
};
