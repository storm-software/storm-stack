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

import { getWorkspaceConfig } from "@storm-software/config-tools/get-config";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { tsconfigPathsToRegExp } from "bundle-require";
import type {
  TransformResult,
  UnpluginBuildContext,
  UnpluginContext,
  UnpluginContextMeta,
  UnpluginFactory,
  UnpluginInstance
} from "unplugin";
import { createUnplugin } from "unplugin";
import { Engine } from "../base/engine";
import { createLog } from "../lib/logger";
import { handleLoad } from "../lib/unplugin/load";
import { handleResolveId } from "../lib/unplugin/resolve-id";
import { getSourceFile } from "../lib/utilities/source-file";
import type {
  Context,
  UnpluginBuildInlineConfig,
  WorkspaceConfig
} from "../types";
import type { UserConfig } from "../types/config";

export type StormStackUnpluginFactory = UnpluginFactory<UserConfig>;
export type StormStackUnpluginInstance = UnpluginInstance<UserConfig>;

/**
 * Creates a Storm Stack unplugin instance.
 *
 * @param userConfig - The user configuration for the unplugin.
 * @returns The unplugin instance.
 */
export const unpluginFactory: StormStackUnpluginFactory = (
  userConfig: UserConfig,
  meta: UnpluginContextMeta
) => {
  const log = createLog("unplugin", userConfig);
  log(LogLevelLabel.DEBUG, "Initializing Unplugin");

  try {
    const inlineConfig = {
      ...userConfig,
      command: "build",
      unplugin: meta
    } as UnpluginBuildInlineConfig;

    let workspaceConfig!: WorkspaceConfig;
    let engine!: Engine;
    let context!: Context;

    let resolvePatterns: RegExp[] = [];

    async function buildStart(this: UnpluginBuildContext): Promise<void> {
      log(LogLevelLabel.DEBUG, "Storm Stack build plugin starting...");

      workspaceConfig = await getWorkspaceConfig();
      engine = new Engine(inlineConfig, workspaceConfig);

      log(LogLevelLabel.DEBUG, "Initializing Storm Stack...");
      context = await engine.init(inlineConfig);

      if (context.options.skipNodeModulesBundle) {
        resolvePatterns = tsconfigPathsToRegExp(
          context.tsconfig.options.paths ?? []
        );
      }

      log(LogLevelLabel.DEBUG, "Prepare Storm Stack project...");
      await engine.prepare(inlineConfig);
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
        context,
        {
          id,
          importer,
          options
        },
        {
          skipNodeModulesBundle: context.options.skipNodeModulesBundle,
          external: context.options.external,
          noExternal: context.options.noExternal,
          resolvePatterns
        }
      );
    }

    async function load(
      this: UnpluginBuildContext & UnpluginContext,
      id: string
    ): Promise<TransformResult> {
      return handleLoad(context, { id });
    }

    async function transform(
      code: string,
      id: string
    ): Promise<TransformResult> {
      return context.compiler.getResult(
        getSourceFile(id, code),
        await context.compiler.compile(context, id, code)
      );
    }

    async function writeBundle(): Promise<void> {
      log(LogLevelLabel.DEBUG, "Finalizing Storm Stack project output...");
      await engine.finalize(inlineConfig);
    }

    return {
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
      writeBundle,
      vite: {
        sharedDuringBuild: true
      }
    };
  } catch (error) {
    log(LogLevelLabel.FATAL, error);

    throw error;
  }
};

export const StormStack: StormStackUnpluginInstance =
  /* #__PURE__ */ createUnplugin(unpluginFactory);

export default StormStack;
