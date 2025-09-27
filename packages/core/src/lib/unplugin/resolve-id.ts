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

import { match } from "bundle-require";
import type { ExternalIdResult } from "unplugin";
import type { Context } from "../../types/context";

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."
const NON_NODE_MODULE_REGEX = /^[A-Z]:[/\\]|^\.{0,2}\/|^\.{1,2}$/;

export interface ResolveIdArgs {
  id: string;
  importer: string | undefined;
  options: {
    isEntry: boolean;
  };
}

export interface ResolveIdOptions {
  skipNodeModulesBundle?: boolean;
  external: (string | RegExp)[];
  noExternal: (string | RegExp)[];
  resolvePatterns: (string | RegExp)[];
}

/**
 * Handle the resolveId hook for the unplugin.
 *
 * @param context - The plugin context.
 * @param args - The arguments for the hook.
 * @param options - The options for the hook.
 * @returns The resolved id or null if not found.
 */
export async function handleResolveId(
  context: Context,
  args: ResolveIdArgs,
  options: Partial<ResolveIdOptions> = {}
): Promise<ExternalIdResult | null | undefined> {
  if (args.id) {
    if (options.skipNodeModulesBundle) {
      if (
        context.vfs.isVirtualFile(args.id) ||
        (args.importer &&
          context.vfs.isVirtualFile(args.id, {
            paths: [args.importer]
          }))
      ) {
        const resolvedPath = args.importer
          ? context.vfs.resolvePath(args.id, {
              paths: [args.importer]
            })
          : context.vfs.resolvePath(args.id);
        if (resolvedPath) {
          return {
            id: resolvedPath,
            external: context.options.projectType !== "application"
          };
        }
      }

      if (context.vfs.isTsconfigPath(args.id)) {
        const tsconfigPath = context.vfs.resolveTsconfigPath(args.id);
        const tsconfigPathPackage = context.vfs.resolveTsconfigPathPackage(
          args.id
        );
        if (tsconfigPath && tsconfigPathPackage) {
          return {
            id: tsconfigPath,
            external: Boolean(
              !options.noExternal?.includes(tsconfigPathPackage) &&
                (options.external?.includes(tsconfigPathPackage) ??
                  context.options.projectType !== "application")
            )
          };
        }
      }

      if (
        match(args.id, options.resolvePatterns) ||
        match(args.id, options.noExternal) ||
        args.id.startsWith("internal:") ||
        args.id.startsWith("virtual:")
      ) {
        return undefined;
      }

      if (match(args.id, options.external) || args.id.startsWith("node:")) {
        return { id: args.id, external: true };
      }

      // Exclude any other import that looks like a Node module
      if (!NON_NODE_MODULE_REGEX.test(args.id)) {
        return {
          id: args.id,
          external: true
        };
      }
    } else {
      if (
        context.vfs.isVirtualFile(args.id) ||
        (args.importer &&
          context.vfs.isVirtualFile(args.id, {
            paths: [args.importer]
          }))
      ) {
        const resolvedPath = args.importer
          ? context.vfs.resolvePath(args.id, {
              paths: [args.importer]
            })
          : context.vfs.resolvePath(args.id);
        if (resolvedPath) {
          return {
            id: resolvedPath,
            external: context.options.projectType !== "application"
          };
        }
      }

      if (context.vfs.isTsconfigPath(args.id)) {
        const tsconfigPath = context.vfs.resolveTsconfigPath(args.id);
        const tsconfigPathPackage = context.vfs.resolveTsconfigPathPackage(
          args.id
        );
        if (tsconfigPath && tsconfigPathPackage) {
          return {
            id: tsconfigPath,
            external: Boolean(
              !options.noExternal?.includes(tsconfigPathPackage) &&
                (options.external?.includes(tsconfigPathPackage) ??
                  context.options.projectType !== "application")
            )
          };
        }
      }

      if (
        match(args.id, options.noExternal) ||
        context.vfs.isBuiltinFile(args.id) ||
        (args.importer &&
          context.vfs.isBuiltinFile(args.id, {
            paths: [args.importer]
          }))
      ) {
        return undefined;
      }

      if (match(args.id, options.external) || args.id.startsWith("node:")) {
        return { id: args.id, external: true };
      }
    }
  }

  return undefined;
}
