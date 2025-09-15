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

import { OutputDirectory, render } from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";

import {
  EngineHooks,
  ResolvedEntryTypeDefinition,
  ResolvedOptions
} from "@storm-stack/core/types/build";
import { Context, ReflectionRecord } from "@storm-stack/core/types/context";
import {
  PluginBaseOptions,
  PluginOptions
} from "@storm-stack/core/types/plugin";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { MaybePromise } from "@stryke/types/base";
import { Output } from "../templates/components/Output";

/**
 * A base Storm Stack Plugin for using [Alloy Framework](https://alloy-framework.github.io/alloy/) to render runtime modules.
 */
export default abstract class AlloyPlugin<
  TContext extends Context<
    ResolvedOptions,
    { [P in keyof unknown]: ReflectionRecord },
    ResolvedEntryTypeDefinition
  > = Context<
    ResolvedOptions,
    { [P in keyof unknown]: ReflectionRecord },
    ResolvedEntryTypeDefinition
  >,
  TOptions extends PluginBaseOptions = PluginBaseOptions
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
      "prepare:runtime": this.prepareRuntime.bind(this)
    });
  }

  /**
   * Renders the runtime and entry module(s) using Alloy.
   *
   * @param context - The context of the current build.
   * @returns The rendered runtime and entry module(s) as JSX children.
   */
  protected abstract render(context: TContext): MaybePromise<Children>;

  /**
   * Prepares the runtime modules for the Storm Stack project.
   *
   * @param context - The context of the current build.
   * @returns A promise that resolves when the preparation is complete.
   */
  private async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime modules for the Storm Stack project.`
    );

    const rendered = await Promise.resolve(this.render(context));

    await this.writeRuntimeDirectory(
      context,
      render(<Output context={context}>{rendered}</Output>, {
        printWidth: 120
      })
    );
  }

  /**
   * Writes the rendered runtime directory to the virtual file system.
   *
   * @param context - The context of the current build.
   * @param dir - The rendered runtime directory.
   */
  private async writeRuntimeDirectory(context: TContext, dir: OutputDirectory) {
    for (const sub of dir.contents) {
      if ("contents" in sub) {
        if (Array.isArray(sub.contents)) {
          await this.writeRuntimeDirectory(context, sub as OutputDirectory);
        } else {
          await context.vfs.writeRuntimeFile(
            `${kebabCase(sub.path)}.ts`,
            joinPaths(context.runtimePath, `${kebabCase(sub.path)}.ts`),
            sub.contents
          );
        }
      } else {
        // TODO: support copy file
      }
    }
  }
}
