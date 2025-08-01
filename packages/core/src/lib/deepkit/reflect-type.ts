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

import type { Type } from "@deepkit/type";
import { reflect } from "@deepkit/type";
import type { TypeDefinition } from "@stryke/types/configuration";
import defu from "defu";
import type { Context } from "../../types/context";
import { bundle, BundleOptions } from "../esbuild/bundle";
import { resolvePath } from "../utilities/resolve-path";

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
  options: BundleOptions = {}
): Promise<TResult> {
  const path = await resolvePath(context, entry.file);
  if (!path || !context.vfs.existsSync(path)) {
    throw new Error(
      `Module not found: "${entry.file}". Please check the path and try again.`
    );
  }

  const result = await bundle(
    context,
    defu(
      {
        entry: [path],
        override: {
          write: false,
          sourcemap: false,
          splitting: false,
          treeShaking: false
        }
      },
      options
    )
  );
  if (result.errors.length > 0) {
    throw new Error(
      `Failed to transpile ${entry.file}: ${result.errors
        .map(error => error.text)
        .join(", ")}`
    );
  }
  if (result.warnings.length > 0) {
    context.log(
      "warn",
      `Warnings while transpiling ${entry.file}: ${result.warnings
        .map(warning => warning.text)
        .join(", ")}`
    );
  }
  if (!result.outputFiles || result.outputFiles.length === 0) {
    throw new Error(
      `No output files generated for ${entry.file}. Please check the configuration and try again.`
    );
  }

  const resolvedTypes = await Promise.all(
    result.outputFiles.map(async outputFile => {
      // await context.vfs.writeFile(outputFile.path, outputFile.text);

      const resolved = (await context.resolver.evalModule(outputFile.text, {
        filename: outputFile.path,
        forceTranspile: true
      })) as Record<string, any>;

      let exportName = entry.name;
      if (!exportName) {
        exportName = "default";
      }

      return resolved[exportName] ?? resolved[`__Ω${exportName}`];
    })
  );

  const resolved = resolvedTypes.filter(Boolean)[0] as TResult;
  if (!resolved) {
    throw new Error(
      `No valid reflection types found in ${entry.file}${
        entry.name ? `#${entry.name}` : ""
      }. Please check the file and try again.`
    );
  }

  return resolved;
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
  options: BundleOptions = {}
): Promise<Type> {
  return reflect(await resolveType(context, entry, options));
}
