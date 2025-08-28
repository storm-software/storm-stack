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

import { CompilerOptions, CompilerResult } from "../../types/compiler";
import { Context } from "../../types/context";
import { getSourceFile } from "../utilities/source-file";

export interface LoadArgs {
  id: string;
}

/**
 * Handle the load hook for the unplugin.
 *
 * @param context - The plugin context.
 * @param args - The arguments for the hook.
 * @param options - The options for the hook.
 * @returns The transform result or undefined if not found.
 */
export async function handleLoad(
  context: Context,
  args: LoadArgs,
  options: Partial<CompilerOptions> = {}
): Promise<CompilerResult | undefined> {
  if (args.id) {
    const resolvedPath = context.vfs.resolvePath(args.id, {
      type: "file"
    });

    if (resolvedPath) {
      const contents = await context.vfs.readFile(resolvedPath);
      if (!contents) {
        return undefined;
      }

      const result = await context.compiler.compile(
        context,
        resolvedPath,
        contents,
        options
      );

      return context.compiler.getResult(
        getSourceFile(args.id, contents),
        result
      );
    }
  }

  return undefined;
}
