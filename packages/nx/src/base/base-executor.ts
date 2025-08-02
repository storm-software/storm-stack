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

import { ExecutorContext, PromiseExecutor } from "@nx/devkit";
import { writeError } from "@storm-software/config-tools/logger";
import { StormWorkspaceConfig } from "@storm-software/config/types";
import { withRunExecutor } from "@storm-software/workspace-tools/base/base-executor";
import { BaseExecutorResult } from "@storm-software/workspace-tools/types";
import { Engine } from "@storm-stack/core/base/engine";
import {
  InlineConfig,
  StormStackCommand
} from "@storm-stack/core/types/config";
import { isError } from "@stryke/type-checks/is-error";
import defu from "defu";
import { createEngine } from "../helpers/create-engine";
import { StormStackBaseExecutorSchema } from "./base-executor.schema";

export type StormStackExecutorContext<
  TCommand extends StormStackCommand = StormStackCommand,
  TExecutorSchema extends
    StormStackBaseExecutorSchema = StormStackBaseExecutorSchema
> = ExecutorContext & {
  projectName: string;
  command: TCommand;
  options: TExecutorSchema;
  inlineConfig: InlineConfig;
  workspaceConfig: StormWorkspaceConfig;
};

/**
 * A utility function to create a Storm Stack executor that can be used with the `withRunExecutor` function.
 *
 * @remarks
 * This function is designed to simplify the creation of Storm Stack executors by providing a consistent interface and error handling.
 *
 * @param command - The command that the executor will handle (e.g., "new", "prepare", "build", etc.).
 * @param executorFn - The function that will be executed when the command is run.
 * @returns A Promise that resolves to the result of the executor function.
 */
export function withStormStackExecutor<
  TCommand extends StormStackCommand = StormStackCommand,
  TExecutorSchema extends
    StormStackBaseExecutorSchema = StormStackBaseExecutorSchema
>(
  command: TCommand,
  executorFn: (
    context: StormStackExecutorContext<TCommand, TExecutorSchema>,
    engine: Engine
  ) =>
    | Promise<BaseExecutorResult | null | undefined>
    | BaseExecutorResult
    | null
    | undefined
): PromiseExecutor<TExecutorSchema> {
  return withRunExecutor(
    `Storm Stack ${command} command executor`,
    async (
      options: TExecutorSchema,
      context: ExecutorContext,
      workspaceConfig: StormWorkspaceConfig
    ): Promise<BaseExecutorResult | null | undefined> => {
      if (!context.projectName) {
        throw new Error(
          "The executor requires `projectName` on the context object."
        );
      }

      if (
        !context.projectName ||
        !context.projectsConfigurations?.projects ||
        !context.projectsConfigurations.projects[context.projectName] ||
        !context.projectsConfigurations.projects[context.projectName]?.root
      ) {
        throw new Error(
          "The executor requires `projectsConfigurations` on the context object."
        );
      }

      const inlineConfig = defu(
        {
          root: context.projectsConfigurations.projects[context.projectName]!
            .root,
          sourceRoot:
            context.projectsConfigurations.projects[context.projectName]!
              .sourceRoot,
          output: {
            outputPath:
              context.projectsConfigurations.projects[context.projectName]!
                .targets?.build?.options?.outputPath
          },
          type: context.projectsConfigurations.projects[context.projectName]!
            .projectType,
          command
        },
        options
      ) as InlineConfig;

      const engine = await createEngine(inlineConfig, workspaceConfig);

      try {
        return await Promise.resolve(
          executorFn(
            defu(
              {
                projectName: context.projectName,
                options,
                workspaceConfig,
                inlineConfig,
                command
              },
              context
            ),
            engine
          )
        );
      } catch (error) {
        writeError(
          `An error occurred while executing the Storm Stack ${command} command executor: ${
            isError(error)
              ? `${error.message}

${error.stack}`
              : "Unknown error"
          }`
        );

        return { success: false };
      } finally {
        await engine.finalize(inlineConfig);
      }
    },
    {
      skipReadingConfig: false,
      hooks: {
        applyDefaultOptions: (options: Partial<TExecutorSchema>) => {
          if (options.mode !== "development" && options.mode !== "staging") {
            options.mode = "production";
          }

          return options as TExecutorSchema;
        }
      }
    }
  );
}
