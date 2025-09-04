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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { tsconfigPathsToRegExp } from "bundle-require";
import type {
  TransformResult,
  UnpluginBuildContext,
  UnpluginContext,
  UnpluginContextMeta
} from "unplugin";
import { Engine } from "../../base/engine";
import { createLog } from "../../lib/logger";
import { handleLoad } from "../../lib/unplugin/load";
import { handleResolveId } from "../../lib/unplugin/resolve-id";
import { getSourceFile } from "../../lib/utilities/source-file";
import { ResolvedOptions } from "../../types/build";
import type {
  BuildInlineConfig,
  UnpluginBuildInlineConfig
} from "../../types/config";
import {
  InferPluginOptions,
  StormStackUnpluginFactory,
  UnpluginFactoryOptions
} from "../../types/unplugin";

/**
 * Creates a Storm Stack unplugin instance.
 *
 * @param options - The user configuration for the unplugin.
 * @returns The unplugin instance.
 */
export function createUnpluginFactory<
  TOptions extends ResolvedOptions = ResolvedOptions
>(
  options?: UnpluginFactoryOptions<TOptions>
): StormStackUnpluginFactory<TOptions> {
  const { decorate, framework } = options ?? {};

  return (
    userConfig: Partial<Omit<TOptions["userConfig"], "variant">>,
    meta: UnpluginContextMeta
  ) => {
    const log = createLog("unplugin", {
      logLevel: LogLevelLabel.INFO,
      ...userConfig
    });
    log(LogLevelLabel.DEBUG, "Initializing Unplugin");

    try {
      const inlineConfig = {
        ...userConfig,
        command: "build",
        variant: framework,
        unplugin: meta
      } as UnpluginBuildInlineConfig<TOptions["userConfig"]>;

      let engine!: Engine<TOptions>;
      let resolvePatterns: RegExp[] = [];

      async function buildStart(this: UnpluginBuildContext): Promise<void> {
        log(LogLevelLabel.DEBUG, "Storm Stack build plugin starting...");

        engine = await Engine.create<TOptions>(inlineConfig);

        if (engine.context.options.skipNodeModulesBundle) {
          resolvePatterns = tsconfigPathsToRegExp(
            engine.context.tsconfig.options.paths ?? []
          );
        }

        log(LogLevelLabel.DEBUG, "Prepare Storm Stack project...");
        await engine.prepare(inlineConfig as BuildInlineConfig);
      }

      async function resolveId(
        this: UnpluginBuildContext & UnpluginContext,
        id: string,
        importer?: string,
        options: {
          isEntry: boolean;
        } = { isEntry: false }
      ) {
        return handleResolveId(
          engine.context,
          {
            id,
            importer,
            options
          },
          {
            skipNodeModulesBundle: engine.context.options.skipNodeModulesBundle,
            external: engine.context.options.external,
            noExternal: engine.context.options.noExternal,
            resolvePatterns
          }
        );
      }

      async function load(
        this: UnpluginBuildContext & UnpluginContext,
        id: string
      ): Promise<TransformResult> {
        return handleLoad(engine.context, { id });
      }

      async function transform(
        code: string,
        id: string
      ): Promise<TransformResult> {
        return engine.context.compiler.getResult(
          getSourceFile(id, code),
          await engine.context.compiler.compile(engine.context, id, code)
        );
      }

      async function writeBundle(): Promise<void> {
        log(LogLevelLabel.DEBUG, "Finalizing Storm Stack project output...");
        await engine.finalize();
      }

      const result = {
        name: "storm-stack",
        enforce: "pre",
        resolveId: {
          filter: {
            id: {
              include: [/.*/]
            }
          },
          handler: resolveId
        },
        load: {
          filter: {
            id: {
              include: [/.*/, /^storm:/]
            }
          },
          handler: load
        },
        transform,
        buildStart,
        writeBundle
      } as InferPluginOptions<TOptions["variant"]>;

      return decorate ? decorate(engine, result) : result;
    } catch (error) {
      log(LogLevelLabel.FATAL, (error as Error)?.message);

      throw error;
    }
  };
}
