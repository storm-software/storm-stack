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
import { MaybePromise } from "@stryke/types/base";
import {
  Output,
  OutputEntry,
  OutputRuntime
} from "../templates/components/Output";
import { renderAsync } from "../templates/helpers/render";
import { OutputDirectory, RuntimeOutputDirectory } from "../types/templates";

/**
 * A base Storm Stack Plugin for using [Alloy Framework](https://alloy-framework.github.io/alloy/) to render runtime modules.
 */
export default abstract class RenderPlugin<
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
      "prepare:runtime": this.prepareRuntime.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:output": this.prepareOutput.bind(this)
    });
  }

  /**
   * Renders the runtime modules using Alloy.
   *
   * @remarks
   * The child class is expected to override this function and return the templates used to generate the runtime modules
   *
   * @param context - The context of the current build.
   * @returns The rendered runtime modules as JSX children.
   */
  protected renderRuntime(context: TContext): MaybePromise<Children> {
    return null;
  }

  /**
   * Renders the entry modules using Alloy.
   *
   * @remarks
   * The child class is expected to override this function and return the templates used to generate the entry modules
   *
   * @param context - The context of the current build.
   * @returns The rendered entry module(s) as JSX children.
   */
  protected renderEntry(context: TContext): MaybePromise<Children> {
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
  protected renderOutput(context: TContext): MaybePromise<Children> {
    return null;
  }

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

    const rendered = await Promise.resolve(this.renderRuntime(context));
    if (rendered) {
      const result = await renderAsync(
        context,
        <OutputRuntime context={context}>{rendered}</OutputRuntime>,
        {
          mode: "runtime",
          printWidth: 120
        }
      );

      await this.writeRuntimeDirectory(context, result.runtime);
    }
  }

  /**
   * Prepares the runtime modules for the Storm Stack project.
   *
   * @param context - The context of the current build.
   * @returns A promise that resolves when the preparation is complete.
   */
  private async prepareEntry(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the entry modules for the Storm Stack project.`
    );

    const result = await renderAsync(
      context,
      <OutputEntry context={context}>
        {await Promise.resolve(this.renderEntry(context))}
      </OutputEntry>,
      {
        mode: "entry",
        printWidth: 120
      }
    );

    await this.writeEntryDirectory(context, result.output);
  }

  /**
   * Prepares the output modules for the Storm Stack project.
   *
   * @param context - The context of the current build.
   * @returns A promise that resolves when the preparation is complete.
   */
  private async prepareOutput(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the output modules for the Storm Stack project.`
    );

    const result = await renderAsync(
      context,
      <Output context={context}>
        {await Promise.resolve(this.renderOutput(context))}
      </Output>,
      {
        mode: "output",
        printWidth: 120
      }
    );

    await this.writeOutputDirectory(context, result.output);
  }

  /**
   * Writes the rendered runtime directory to the virtual file system.
   *
   * @param context - The context of the current build.
   * @param dir - The rendered runtime directory.
   */
  private async writeRuntimeDirectory(
    context: TContext,
    dir: RuntimeOutputDirectory
  ) {
    for (const sub of dir.contents) {
      if ("contents" in sub) {
        if (Array.isArray(sub.contents)) {
          await this.writeRuntimeDirectory(
            context,
            sub as RuntimeOutputDirectory
          );
        } else if (sub.kind === "file") {
          await context.vfs.writeRuntimeFile(sub.id, sub.path, sub.contents);
        }
      } else {
        // TODO: support copy file
      }
    }
  }

  /**
   * Writes the rendered runtime directory to the virtual file system.
   *
   * @param context - The context of the current build.
   * @param dir - The rendered entry directory.
   */
  private async writeEntryDirectory(context: TContext, dir: OutputDirectory) {
    for (const sub of dir.contents) {
      if ("contents" in sub) {
        if (Array.isArray(sub.contents)) {
          await this.writeEntryDirectory(context, sub as OutputDirectory);
        } else if (sub.kind === "file") {
          await context.vfs.writeEntryFile(sub.path, sub.contents);
        }
      } else {
        // TODO: support copy file
      }
    }
  }

  /**
   * Writes the rendered directory to the virtual file system.
   *
   * @param context - The context of the current build.
   * @param dir - The rendered directory.
   */
  private async writeOutputDirectory(context: TContext, dir: OutputDirectory) {
    for (const sub of dir.contents) {
      if ("contents" in sub) {
        if (Array.isArray(sub.contents)) {
          await this.writeOutputDirectory(context, sub as OutputDirectory);
        } else if (sub.kind === "file") {
          await context.vfs.writeFile(sub.path, sub.contents, {
            outputMode: sub.outputMode
          });
        }
      } else {
        // TODO: support copy file
      }
    }
  }
}
