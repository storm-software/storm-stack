import { deepMerge } from "@storm-software/utilities/helper-fns/deep-merge";
import { isSetObject } from "@storm-software/utilities/type-checks/is-set-object";
import { DeepPartial } from "@storm-software/utilities/types";
import { CosmiconfigResult, cosmiconfig } from "cosmiconfig";
import { getDefaultConfig } from "./default-config";
import { StormConfig, wrapped_StormConfig } from "./types";

const _config_cache = new WeakMap<WeakKey, StormConfig>();
let _static_cache: StormConfig | undefined = undefined;

const getConfigFileName = (
  fileName: string
): Promise<CosmiconfigResult | undefined> =>
  cosmiconfig(fileName, { cache: true }).search();

const getStaticConfig = async (): Promise<StormConfig | undefined> => {
  if (_static_cache) {
    return _static_cache as StormConfig;
  }

  let configFile = await getConfigFileName("storm");
  if (!configFile || configFile.isEmpty) {
    configFile = await getConfigFileName("storm-software");
    if (!configFile || configFile.isEmpty) {
      configFile = await getConfigFileName("storm-stack");
      if (!configFile || configFile.isEmpty) {
        configFile = await getConfigFileName("storm-cloud");
        if (!configFile || configFile.isEmpty) {
          configFile = await getConfigFileName("acidic");
          if (!configFile || configFile.isEmpty) {
            configFile = await getConfigFileName("acid");
          }
        }
      }
    }
  }

  if (!isSetObject(configFile) || configFile.isEmpty || !configFile.filepath) {
    console.warn(
      "No Storm config file found in the current workspace. Please ensure this is the expected behavior - you can add a `storm.config.js` file to the root of your workspace if it is not."
    );
    return undefined;
  }

  let result: StormConfig | undefined = undefined;

  const defaultConfig = await getDefaultConfig();
  if (defaultConfig) {
    result = await wrapped_StormConfig.parse(
      deepMerge(configFile.config, defaultConfig)
    );
  }

  result && (result.configFile = configFile.filepath);
  _static_cache = result;

  return result;
};

/**
 * Get the config for the current Storm workspace's config file
 *
 * @param defaultConfig - The default config to apply under the current workspace config
 * @returns The config for the current Storm workspace
 */
export const loadStormConfig = async <
  TConfig extends StormConfig = StormConfig
>(
  defaultConfig?: DeepPartial<TConfig>
): Promise<TConfig> => {
  const cacheKey = defaultConfig ?? {};
  if (_config_cache.has(cacheKey)) {
    return _config_cache.get(cacheKey) as TConfig;
  }

  const config: StormConfig = deepMerge(await getStaticConfig(), defaultConfig);
  const validateResult = (await wrapped_StormConfig.validate(
    config
  )) as unknown as {
    success: boolean;
    issues: string[];
  };
  if (validateResult?.success === false) {
    throw new Error(
      `The following issues occurred while initializing the Storm configuration: \n${validateResult.issues.join(
        "\n"
      )}`
    );
  }

  _config_cache.set(cacheKey, config);
  return config as TConfig;
};
