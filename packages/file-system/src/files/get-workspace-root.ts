import { createStormConfig } from "@storm-software/config-tools";
import { findWorkspaceRoot } from "nx/src/utils/find-workspace-root.js";

export const getWorkspaceRoot = () => {
  if (!process.env.STORM_WORKSPACE_ROOT) {
    const config = createStormConfig();
    if (config?.workspaceRoot) {
      process.env.STORM_WORKSPACE_ROOT = config.workspaceRoot;
      process.env.NX_WORKSPACE_ROOT_PATH ??= config.workspaceRoot;

      return config.workspaceRoot;
    }

    const root = findWorkspaceRoot(process.cwd());
    process.env.STORM_WORKSPACE_ROOT = root?.dir;
    process.env.NX_WORKSPACE_ROOT_PATH ??= root?.dir;

    return root?.dir;
  }

  return process.env.STORM_WORKSPACE_ROOT;
};
