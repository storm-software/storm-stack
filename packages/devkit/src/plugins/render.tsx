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

/* eslint-disable unused-imports/no-unused-vars */

import {
  flushJobsAsync,
  getContextForRenderNode,
  isPrintHook,
  RenderedTextTree,
  renderTree
} from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import {
  EngineHooks,
  ResolvedEntryTypeDefinition,
  ResolvedOptions
} from "@storm-stack/core/types/build";
import { Context, ReflectionRecord } from "@storm-stack/core/types/context";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { isParentPath } from "@stryke/path/is-parent-path";
import { replacePath } from "@stryke/path/replace";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { Doc } from "prettier";
import { printer } from "prettier/doc.js";
import { Output } from "../templates/components/output";
import { RenderPluginOptions } from "../types/plugins";
import { OutputDirectory, OutputFile, RenderContext } from "../types/templates";

export interface PrintTreeOptions {
  /**
   * The number of characters the printer will wrap on. Defaults to 100
   * characters.
   */
  printWidth?: number;

  /**
   * Whether to use tabs instead of spaces for indentation. Defaults to false.
   */
  useTabs?: boolean;

  /**
   * The number of spaces to use for indentation. Defaults to 2 spaces.
   */
  tabWidth?: number;

  /**
   * If files should end with a final new line.
   * @default true
   */
  insertFinalNewLine?: boolean;
}

/**
 * A base Storm Stack Plugin for using [Alloy Framework](https://alloy-framework.github.io/alloy/) to render runtime modules.
 */
abstract class RenderPlugin<
  TContext extends Context<
    ResolvedOptions,
    { [P in keyof unknown]: ReflectionRecord },
    ResolvedEntryTypeDefinition
  > = Context<
    ResolvedOptions,
    { [P in keyof unknown]: ReflectionRecord },
    ResolvedEntryTypeDefinition
  >,
  TOptions extends RenderPluginOptions = RenderPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "prepare:builtins": this.prepareBuiltins.bind(this),
      "prepare:generate": this.prepareGenerate.bind(this)
    });
  }

  /**
   * Renders the builtin runtime modules using Alloy.
   *
   * @remarks
   * The child class is expected to override this function and return the templates used to generate the builtin runtime modules
   *
   * @param context - The context of the current build.
   * @returns The rendered builtin runtime modules as JSX children.
   */
  protected renderBuiltins(context: TContext): Children {
    return null;
  }

  /**
   * Renders the output modules using Alloy.
   *
   * @remarks
   * The child class is expected to override this function and return the templates used to generate the output modules
   *
   * @param context - The context of the current build.
   * @returns The rendered output module(s) as JSX children.
   */
  protected render(context: TContext): Children {
    return null;
  }

  /**
   * Prepares the built-in runtime modules for the Storm Stack project.
   *
   * @param context - The context of the current build.
   * @returns A promise that resolves when the preparation is complete.
   */
  private async prepareBuiltins(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the built-in runtime modules for the Storm Stack project.`
    );

    const tree = renderTree(
      <Output
        context={context}
        basePath={replacePath(
          context.builtinsPath,
          context.options.workspaceRoot
        )}>
        {this.renderBuiltins(context)}
      </Output>
    );

    return this.#writeTree(context, tree);
  }

  /**
   * Prepares the runtime modules for the Storm Stack project.
   *
   * @param context - The context of the current build.
   * @returns A promise that resolves when the preparation is complete.
   */
  private async prepareGenerate(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the entry modules for the Storm Stack project.`
    );

    const tree = renderTree(
      <Output context={context} basePath={context.options.workspaceRoot}>
        {this.render(context)}
      </Output>
    );

    return this.#writeTree(context, tree);
  }

  /**
   * Writes the rendered output files to the virtual file system.
   *
   * @param context - The context of the current build.
   * @param tree - The rendered output files.
   */
  async #writeTree(context: TContext, tree: RenderedTextTree) {
    await flushJobsAsync();

    let result!: OutputDirectory;
    const generateOutput = async (
      currentDirectory: OutputDirectory | undefined,
      root: RenderedTextTree
    ) => {
      if (!Array.isArray(root)) {
        return;
      }

      const recurse = async (cwd: OutputDirectory | undefined) => {
        for (const child of root) {
          await generateOutput(cwd, child as RenderedTextTree);
        }
      };

      const renderContext = getContextForRenderNode(root) as
        | RenderContext
        | undefined;
      if (!renderContext) {
        return recurse(currentDirectory);
      }

      if (renderContext.meta?.directory) {
        const directory: OutputDirectory = {
          kind: "directory",
          path: renderContext.meta.directory.path,
          contents: []
        };

        if (currentDirectory) {
          currentDirectory.contents.push(directory);
        } else {
          result = directory;
        }

        await recurse(directory);
      } else if (renderContext.meta?.sourceFile) {
        if (!currentDirectory) {
          // This shouldn't happen if you're using the Output component.
          throw new Error(
            "Source file doesn't have parent directory. Make sure you have used the Output component."
          );
        }

        let outputFile!: OutputFile;
        if (renderContext.meta?.builtin) {
          if (!renderContext.meta.builtin.id) {
            throw new Error(
              "Built-in runtime module doesn't have an ID. Make sure you have used the `<BuiltinFile />` component."
            );
          }

          this.log(
            LogLevelLabel.TRACE,
            `Rendering built-in runtime module with ID: ${renderContext.meta.builtin.id}`
          );

          outputFile = {
            kind: "builtin",
            id: renderContext.meta.builtin.id,
            path: replacePath(
              renderContext.meta.sourceFile.path,
              context.builtinsPath
            ),
            filetype: renderContext.meta.sourceFile.filetype,
            outputMode: renderContext.meta.output?.outputMode,
            contents: await this.#printTree(context, root)
          };
        } else if (
          renderContext.meta?.entry ||
          isParentPath(context.entryPath, renderContext.meta.sourceFile.path)
        ) {
          this.log(
            LogLevelLabel.TRACE,
            `Rendering entry module at path: ${renderContext.meta.sourceFile.path}`
          );

          outputFile = {
            kind: "entry",
            typeDefinition: renderContext.meta.entry?.typeDefinition,
            path: renderContext.meta.sourceFile.path,
            filetype: renderContext.meta.sourceFile.filetype,
            outputMode: renderContext.meta.output?.outputMode,
            contents: await this.#printTree(context, root)
          };
        } else {
          this.log(
            LogLevelLabel.TRACE,
            `Rendering source file at path: ${renderContext.meta.sourceFile.path}`
          );

          outputFile = {
            kind: "file",
            path: renderContext.meta.sourceFile.path,
            filetype: renderContext.meta.sourceFile.filetype,
            outputMode: renderContext.meta.output?.outputMode,
            contents: await this.#printTree(context, root)
          };
        }

        currentDirectory.contents.push(outputFile);
      } else if (renderContext.meta?.copyFile) {
        if (!currentDirectory) {
          // This shouldn't happen if you're using the Output component.
          throw new Error(
            "Copy file doesn't have parent directory. Make sure you have used the Output component."
          );
        }

        this.log(
          LogLevelLabel.TRACE,
          `Processing copy file operation from "${
            renderContext.meta.copyFile.sourcePath
          }" to "${renderContext.meta.copyFile.path}"`
        );

        if (!renderContext.meta.copyFile.sourcePath) {
          throw new Error(
            "Copy file doesn't have a source path. Make sure you have provided a `sourcePath` property to the `meta.copyFile` context."
          );
        }

        if (!renderContext.meta.copyFile.path) {
          throw new Error(
            "Copy file doesn't have a destination path. Make sure you have provided a `path` property to the `meta.copyFile` context."
          );
        }

        currentDirectory.contents.push({
          kind: "file",
          path: renderContext.meta.copyFile.path,
          sourcePath: renderContext.meta.copyFile.sourcePath,
          outputMode: renderContext.meta.output?.outputMode
        });
      } else {
        await recurse(currentDirectory);
      }
    };

    await generateOutput(undefined, tree);

    const writeOutput = async (context: TContext, output: OutputDirectory) => {
      for (const sub of output.contents) {
        if (sub.kind === "directory") {
          await writeOutput(context, sub);
        } else if (sub.kind === "builtin") {
          await context.vfs.writeBuiltinFile(
            sub.id,
            replacePath(sub.path, context.builtinsPath),
            sub.contents,
            {
              outputMode: sub.outputMode,
              skipFormat: false
            }
          );
        } else if (sub.kind === "entry") {
          await context.vfs.writeEntryFile(sub.path, sub.contents, {
            outputMode: sub.outputMode,
            skipFormat: false
          });
        } else if (sub.kind === "file") {
          if ("sourcePath" in sub && sub.sourcePath) {
            if (!context.vfs.existsSync(sub.sourcePath)) {
              throw new Error(
                `Source file "${sub.sourcePath}" for copy operation does not exist.`
              );
            }

            const source = await context.vfs.readFile(sub.sourcePath);
            if (!isSetString(source)) {
              throw new Error(
                `Source file "${sub.sourcePath}" for copy operation is empty.`
              );
            }

            await context.vfs.writeFile(sub.path, source, {
              outputMode: sub.outputMode
            });
          } else if ("contents" in sub && isSetString(sub.contents)) {
            await context.vfs.writeFile(sub.path, sub.contents, {
              outputMode: sub.outputMode
            });
          } else {
            throw new Error(
              `Unexpected output extracted from the render tree: \n\n${JSON.stringify(sub, null, 2)}`
            );
          }
        }
      }
    };

    await writeOutput(context, result);
  }

  #printTree = async (context: TContext, tree: RenderedTextTree) => {
    const options = {
      printWidth: this.getOptions(context).printWidth ?? 160,
      tabWidth: this.getOptions(context).tabWidth ?? 2,
      useTabs: this.getOptions(context).useTabs ?? false,
      insertFinalNewLine: this.getOptions(context).insertFinalNewLine ?? true
    };

    await flushJobsAsync();

    const result = printer.printDocToString(
      this.#printTreeWorker(tree),
      options as printer.Options
    ).formatted;

    return options.insertFinalNewLine && !result.endsWith("\n")
      ? `${result}\n`
      : result;
  };

  #printTreeWorker = (tree: RenderedTextTree): Doc => {
    const doc: Doc = [];
    for (const node of tree) {
      if (typeof node === "string") {
        const normalizedNode = node
          .split(/\r?\n/)
          .flatMap((line, index, array) =>
            index < array.length - 1 ? [line] : [line]
          );
        doc.push(normalizedNode);
      } else if (isPrintHook(node)) {
        doc.push(node.print!(node.subtree, this.#printTreeWorker));
      } else {
        doc.push(this.#printTreeWorker(node));
      }
    }

    return doc;
  };
}

export default RenderPlugin;
