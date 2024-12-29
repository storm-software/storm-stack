import resolveFrom from "resolve-from";
import { getWorkspaceRoot } from "./get-workspace-root";

/**
 * Resolves a module from the current working directory
 *
 * @param moduleName - The name of the module to resolve
 */
export function localRequire(moduleName: string, cwd = getWorkspaceRoot()) {
  const p = resolveFrom.silent(cwd, moduleName);
  return p && require(p);
}
