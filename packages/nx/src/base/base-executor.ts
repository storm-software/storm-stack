import { ExecutorContext } from "@nx/devkit";
import { StormConfig, setEnv } from "@storm-software/config";
import { StormTime } from "@storm-software/date-time";
import { StormError } from "@storm-software/errors";
import { StormLog } from "@storm-software/logging";
import { stringify } from "@storm-software/serialization/json-parser";
import { MaybePromise, isError } from "@storm-software/utilities";
import { applyWorkspaceTokens } from "@storm-software/workspace-tools";
import { NxErrorCode } from "../errors";

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
    ) => MaybePromise<BaseExecutorResult | null | undefined> | null | undefined,
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
      if (isError(result?.error)) {
        throw new StormError(NxErrorCode.executor_failure, {
          message: `The ${name} executor failed to run`,
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
      StormLog.stopwatch(name, startTime);
    }
  };
