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

import {
  getContextForRenderNode,
  printTree,
  RenderedTextTree,
  renderTree
} from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { Context } from "@storm-stack/core/types/context";
import {
  ContentOutputFile,
  CopyOutputFile,
  OutputDirectory,
  RenderOptions,
  RenderOutput
} from "../../types/templates";
import { flushJobs, flushJobsAsync } from "./scheduler";

export function render<TRenderOptions extends RenderOptions = RenderOptions>(
  context: Context,
  children: Children,
  options: TRenderOptions = {} as TRenderOptions
): RenderOutput<TRenderOptions> {
  const tree = renderTree(children);
  flushJobs();

  return sourceFilesForTree(context, tree, options);
}

export async function renderAsync<
  TRenderOptions extends RenderOptions = RenderOptions
>(
  context: Context,
  children: Children,
  options: TRenderOptions = {} as TRenderOptions
): Promise<RenderOutput<TRenderOptions>> {
  const tree = renderTree(children);
  await flushJobsAsync();

  return sourceFilesForTree(context, tree, options);
}

function sourceFilesForTree<
  TRenderOptions extends RenderOptions = RenderOptions
>(
  context: Context,
  tree: RenderedTextTree,
  options: TRenderOptions
): RenderOutput<TRenderOptions> {
  const result: RenderOutput<TRenderOptions> = {
    runtime: {
      kind: "directory",
      path: context.runtimePath,
      contents: []
    },
    entry: (options.mode === "runtime"
      ? null
      : {
          kind: "directory",
          path: context.entryPath,
          contents: []
        }) as RenderOutput<TRenderOptions>["entry"],
    output: null as RenderOutput<TRenderOptions>["output"]
  };

  collectSourceFiles(undefined, tree);

  if (!result.runtime && !result.entry && !result.output) {
    throw new Error(
      "No source files were rendered. Make sure you have used the `Output` component to wrap your template components or are using the `RenderPlugin` to render the templates from `@storm-stack/devkit`."
    );
  }

  return result;

  function collectSourceFiles(
    currentDirectory: OutputDirectory | undefined,
    root: RenderedTextTree
  ) {
    if (!Array.isArray(root)) {
      return;
    }

    const renderContext = getContextForRenderNode(root);
    if (!renderContext) {
      return recurse(currentDirectory);
    }

    if (renderContext.meta?.runtime) {
      return recurse(result.runtime);
    } else if (renderContext.meta?.directory) {
      const directory: OutputDirectory = {
        kind: "directory",
        path: renderContext.meta.directory.path,
        contents: []
      };

      if (currentDirectory) {
        currentDirectory.contents.push(directory);
      } else {
        result.output = directory as RenderOutput<TRenderOptions>["output"];
      }

      recurse(directory);
    } else if (renderContext.meta?.sourceFile) {
      if (!currentDirectory) {
        // This shouldn't happen if you're using the Output component.
        throw new Error(
          "Source file doesn't have parent directory. Make sure you have used the Output component."
        );
      }

      const sourceFile: ContentOutputFile = {
        kind: "file",
        path: renderContext.meta.sourceFile.path,
        filetype: renderContext.meta.sourceFile.filetype,
        outputMode: renderContext.meta.output?.outputMode,
        contents: printTree(root, {
          printWidth:
            options?.printWidth ?? renderContext.meta.printOptions?.printWidth,
          tabWidth:
            options?.tabWidth ?? renderContext.meta.printOptions?.tabWidth,
          useTabs: options?.useTabs ?? renderContext.meta.printOptions?.useTabs,
          insertFinalNewLine:
            options?.insertFinalNewLine ??
            renderContext.meta.printOptions?.insertFinalNewLine ??
            true
        })
      };

      currentDirectory.contents.push(sourceFile);
    } else if (renderContext.meta?.copyFile) {
      if (!currentDirectory) {
        // This shouldn't happen if you're using the Output component.
        throw new Error(
          "Copy file doesn't have parent directory. Make sure you have used the Output component."
        );
      }

      const sourceFile: CopyOutputFile = {
        kind: "file",
        path: renderContext.meta?.copyFile.path,
        sourcePath: renderContext.meta?.copyFile.sourcePath
      };

      currentDirectory.contents.push(sourceFile);
    } else {
      recurse(currentDirectory);
    }

    function recurse(cwd: OutputDirectory | undefined) {
      for (const child of root) {
        collectSourceFiles(cwd, child as RenderedTextTree);
      }
    }
  }
}
