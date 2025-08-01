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

import { joinPaths } from "@stryke/path/join-paths";
import { Jiti, JitiOptions, createJiti } from "jiti";

export type CreateResolverOptions = Omit<
  JitiOptions,
  "fsCache" | "moduleCache" | "interopDefault"
> & {
  workspaceRoot: string;
  projectRoot: string;
  cacheDir: string;
};

/**
 * Create a Jiti resolver for the given workspace and project root.
 *
 * @param options - The options for creating the resolver.
 * @returns A Jiti instance configured for the specified workspace and project root.
 */
export function createResolver(options: CreateResolverOptions): Jiti {
  return createJiti(joinPaths(options.workspaceRoot, options.projectRoot), {
    ...options,
    interopDefault: true,
    fsCache: joinPaths(options.cacheDir, "jiti"),
    moduleCache: true
  });
}
