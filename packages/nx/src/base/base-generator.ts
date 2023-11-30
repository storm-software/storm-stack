import { Tree } from "@nx/devkit";
import { StormConfig, setEnv } from "@storm-software/config";
import { StormTime } from "@storm-software/date-time";
import { StormError } from "@storm-software/errors";
import { StormLog } from "@storm-software/logging";
import { stringify } from "@storm-software/serialization/json-parser";
import { MaybePromise, isError } from "@storm-software/utilities";
import { NxErrorCode } from "../errors";

export interface BaseGeneratorSchema extends Record<string, any> {
  main?: string;
  outputPath?: string;
  tsConfig?: string;
}

export interface BaseGeneratorOptions {
  skipReadingConfig?: boolean;
}

export interface BaseGeneratorResult {
  error?: Error;
}

export const withRunGenerator =
  <TGeneratorSchema = any>(
    name: string,
    generatorFn: (
      tree: Tree,
      options: TGeneratorSchema,
      config?: StormConfig
    ) =>
      | MaybePromise<BaseGeneratorResult | null | undefined>
      | null
      | undefined,
    generatorOptions: BaseGeneratorOptions = { skipReadingConfig: false }
  ) =>
  async (
    tree: Tree,
    options: TGeneratorSchema
  ): Promise<{ success: boolean }> => {
    const startTime = StormTime.current();

    try {
      StormLog.info(`⚡ Running the ${name} generator...`);
      StormLog.debug(`⚙️ Generator schema options: \n${stringify(options)}`);

      let config: StormConfig | undefined;
      if (!generatorOptions.skipReadingConfig) {
        config = await setEnv();

        StormLog.debug(`Loaded Storm config into env:
${Object.keys(process.env)
  .map(key => ` - ${key}=${process.env[key]}`)
  .join("\n")}`);
      }

      const result = await generatorFn(tree, options, config);
      if (isError(result?.error)) {
        throw new StormError(NxErrorCode.generator_failure, {
          message: `The ${name} generator failed to run`,
          cause: result!.error
        });
      }

      StormLog.success(
        `🎉 Successfully completed running the ${name} generator!`
      );

      return {
        success: true
      };
    } catch (error) {
      StormLog.error(`❌ An error occurred while running the generator`);
      StormLog.fatal(error);

      return {
        success: false
      };
    } finally {
      StormLog.stopwatch(startTime, name);
    }
  };
