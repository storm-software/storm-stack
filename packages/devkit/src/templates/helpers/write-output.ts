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

import type { Children, OutputDirectory } from "@alloy-js/core";
import { render } from "@alloy-js/core";
import { Context } from "@storm-stack/core/types/context";

/**
 * Writes the output of a component to the file system.
 *
 * @param context - The context of the current build.
 * @param children - The root component to render.
 */
export async function writeOutput<TContext extends Context = Context>(
  context: TContext,
  children: Children
) {
  const tree = render(children);
  await writeOutputDirectory<TContext>(context, tree);
}

async function writeOutputDirectory<TContext extends Context = Context>(
  context: TContext,
  dir: OutputDirectory
) {
  for (const sub of dir.contents) {
    if ("contents" in sub) {
      if (Array.isArray(sub.contents)) {
        await writeOutputDirectory(context, sub as OutputDirectory);
      } else {
        await context.vfs.writeFile(sub.path, sub.contents);
      }
    } else {
      // TODO: support copy file
    }
  }
}
