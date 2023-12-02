import { Tree } from "@nx/devkit";
import { StormConfig } from "@storm-software/config/types";
import { setEnv } from "@storm-software/config/utilities/set-env";

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
      | Promise<BaseGeneratorResult | null | undefined>
      | BaseGeneratorResult
      | null
      | undefined
      | null
      | undefined,
    generatorOptions: BaseGeneratorOptions = { skipReadingConfig: false }
  ) =>
  async (
    tree: Tree,
    options: TGeneratorSchema
  ): Promise<{ success: boolean }> => {
    const startTime = Date.now();

    try {
      console.info(`⚡ Running the ${name} generator...`);
      console.debug("⚙️ Generator schema options: \n", options);

      let config: any | undefined;
      if (!generatorOptions.skipReadingConfig) {
        config = await setEnv();

        console.debug(`Loaded Storm config into env:
${Object.keys(process.env)
  .map(key => ` - ${key}=${process.env[key]}`)
  .join("\n")}`);
      }

      const result = await generatorFn(tree, options, config);
      if (
        result?.error &&
        (result?.error as Error)?.message &&
        typeof (result?.error as Error)?.message === "string" &&
        (result?.error as Error)?.name &&
        typeof (result?.error as Error)?.name === "string"
      ) {
        throw new Error(`The ${name} generator failed to run`, {
          cause: result!.error
        });
      }

      console.info(`🎉 Successfully completed running the ${name} generator!`);

      return {
        success: true
      };
    } catch (error) {
      console.error(`❌ An error occurred while running the generator`);
      console.error(error);

      return {
        success: false
      };
    } finally {
      console.info(
        `⏱️ The${name ? ` ${name}` : ""} generator took ${
          Date.now() - startTime
        }ms to complete`
      );
    }
  };
