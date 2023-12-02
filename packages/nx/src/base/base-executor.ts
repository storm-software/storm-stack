import { ExecutorContext } from "@nx/devkit";
import type { StormConfig } from "@storm-software/config/types";
import { setEnv } from "@storm-software/config/utilities/set-env";
import { StormTime } from "@storm-software/date-time/storm-time";
import { StormLog } from "@storm-software/logging/storm-log";
import { stringify } from "@storm-software/serialization/json-parser";
import { applyWorkspaceTokens } from "@storm-software/workspace-tools";

export interface BaseExecutorSchema extends Record<string, any> {
  main?: string;
  outputPath?: string;
  tsConfig?: string;
}

export interface BaseExecutorOptions {
  skipReadingConfig?: boolean;
}

export interface BaseExecutorResult {
  error?: Error;
}

export const withRunExecutor =
  <TExecutorSchema extends BaseExecutorSchema = BaseExecutorSchema>(
    name: string,
    executorFn: (
      options: TExecutorSchema,
      context: ExecutorContext,
      config?: StormConfig
    ) =>
      | Promise<BaseExecutorResult | null | undefined>
      | BaseExecutorResult
      | null
      | undefined,
    executorOptions: BaseExecutorOptions = { skipReadingConfig: false }
  ) =>
  async (
    options: TExecutorSchema,
    context: ExecutorContext
  ): Promise<{ success: boolean }> => {
    const startTime = StormTime.current();

    try {
      StormLog.info(`⚡ Running the ${name} executor...`);
      StormLog.debug(`⚙️ Executor schema options: \n${stringify(options)}`);

      const tokenized = Object.keys(options).reduce(
        (ret: TExecutorSchema, key: keyof TExecutorSchema) => {
          ret[key] = applyWorkspaceTokens(options[key], context);

          return ret;
        },
        options
      );

      let config: StormConfig | undefined;
      if (!executorOptions.skipReadingConfig) {
        config = await setEnv();

        StormLog.debug(`Loaded Storm config into env:
${Object.keys(process.env)
  .map(key => ` - ${key}=${process.env[key]}`)
  .join("\n")}`);
      }

      const result = await executorFn(tokenized, context, config);
      if (
        result?.error &&
        (result?.error as Error)?.message &&
        typeof (result?.error as Error)?.message === "string" &&
        (result?.error as Error)?.name &&
        typeof (result?.error as Error)?.name === "string"
      ) {
        throw new Error(`The ${name} executor failed to run`, {
          cause: result!.error
        });
      }

      StormLog.success(
        `🎉 Successfully completed running the ${name} executor!`
      );

      return {
        success: true
      };
    } catch (error) {
      StormLog.error(`❌ An error occurred while running the executor`);
      StormLog.fatal(error);

      return {
        success: false
      };
    } finally {
      StormLog.stopwatch(startTime, name);
    }
  };
