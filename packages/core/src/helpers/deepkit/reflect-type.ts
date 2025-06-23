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

import type { Type } from "@deepkit/type";
import { reflect } from "@deepkit/type";
import { existsSync } from "@stryke/path/exists";
import {
  findFileExtension,
  findFileName,
  findFilePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import type { TypeDefinition } from "@stryke/types/configuration";
import type { BuildOptions } from "esbuild";
import type { CompileOptions, Context, Options } from "../../types/build";
import { bundle } from "../esbuild/bundle";
import { resolvePath } from "../utilities/resolve-path";

export type ResolveTypeOptions = CompileOptions &
  Pick<Options, "external" | "noExternal" | "skipNodeModulesBundle"> & {
    overrides?: Partial<BuildOptions>;
  };

/**
 * Compiles a type definition to a module.
 *
 * @param context - The context object containing the environment paths.
 * @param entry - The type definition to compile.
 * @returns A promise that resolves to the compiled module.
 */
export async function resolveType<TResult = any>(
  context: Context,
  entry: TypeDefinition,
  options: ResolveTypeOptions = {}
): Promise<TResult> {
  const transpilePath = joinPaths(
    context.artifactsPath,
    "transpiled",
    findFilePath(
      replacePath(
        entry.file,
        joinPaths(
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot
        )
      )
    )
  );

  const path = await resolvePath(context, entry.file);
  if (!path || !existsSync(path)) {
    throw new Error(
      `Module not found: ${entry.file}. Please check the path and try again.`
    );
  }

  const result = await bundle(
    context,
    path,
    transpilePath,
    {
      ...options.overrides,
      write: true
    },
    options
  );
  if (result.errors.length > 0) {
    throw new Error(
      `Failed to transpile ${entry.file}: ${result.errors
        .map(error => error.text)
        .join(", ")}`
    );
  }

  const resolved = await context.resolver.import<Record<string, any>>(
    context.resolver.esmResolve(
      `${joinPaths(
        transpilePath,
        findFileName(entry.file).replace(findFileExtension(entry.file), "")
      )}.js`
    )
  );

  let exportName = entry.name;
  if (!exportName) {
    exportName = "default";
  }

  const resolvedType = resolved[exportName] ?? resolved[`__Ω${exportName}`];
  if (!resolvedType) {
    throw new Error(
      `Unable to resolve type ${exportName} in ${entry.file}. Please check the path and try again.`
    );
  }

  return resolvedType;
}

/**
 * Compiles a type definition to a module.
 *
 * @param context - The context object containing the environment paths.
 * @param entry - The type definition to compile.
 * @param options - The options for resolving the type.
 * @returns A promise that resolves to the compiled module.
 */
export async function reflectType(
  context: Context,
  entry: TypeDefinition,
  options: ResolveTypeOptions = {}
): Promise<Type> {
  return reflect(await resolveType(context, entry, options));
}
