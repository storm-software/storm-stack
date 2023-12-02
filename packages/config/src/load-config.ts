import { CosmiconfigResult, cosmiconfig } from "cosmiconfig";
import {
  ConfigFile,
  StormConfig,
  wrapped_ConfigFile,
  wrapped_StormConfig
} from "./types";
import { getDefaultConfigFile } from "./utilities/default-config";

const _config_cache = new WeakMap<WeakKey, StormConfig>();
let _static_cache: StormConfig | undefined = undefined;

const getConfigFileName = (
  fileName: string
): Promise<CosmiconfigResult | undefined> =>
  cosmiconfig(fileName, { cache: true }).search();

const getStaticConfig = async (
  projectName?: string
): Promise<StormConfig | undefined> => {
  if (_static_cache) {
    return _static_cache as StormConfig;
  }

  let cosmiconfigResult = await getConfigFileName("storm");
  if (!cosmiconfigResult || cosmiconfigResult.isEmpty) {
    cosmiconfigResult = await getConfigFileName("storm-software");
    if (!cosmiconfigResult || cosmiconfigResult.isEmpty) {
      cosmiconfigResult = await getConfigFileName("storm-stack");
      if (!cosmiconfigResult || cosmiconfigResult.isEmpty) {
        cosmiconfigResult = await getConfigFileName("storm-cloud");
        if (!cosmiconfigResult || cosmiconfigResult.isEmpty) {
          cosmiconfigResult = await getConfigFileName("acidic");
          if (!cosmiconfigResult || cosmiconfigResult.isEmpty) {
            cosmiconfigResult = await getConfigFileName("acid");
          }
        }
      }
    }
  }

  if (
    !cosmiconfigResult ||
    Object.keys(cosmiconfigResult).length === 0 ||
    cosmiconfigResult.isEmpty ||
    !cosmiconfigResult.filepath
  ) {
    console.warn(
      "No Storm config file found in the current workspace. Please ensure this is the expected behavior - you can add a `storm.config.js` file to the root of your workspace if it is not."
    );
    return undefined;
  }

  let configFile: ConfigFile | undefined = undefined;

  const defaultConfig = await getDefaultConfigFile();
  if (defaultConfig) {
    configFile = await wrapped_ConfigFile.parse(
      Object.assign(cosmiconfigResult.config, defaultConfig)
    );
  }

  let result!: StormConfig;
  cosmiconfigResult.filepath &&
    (result.configFile = cosmiconfigResult.filepath);
  result.runtimeVersion = "0.0.1";

  if (projectName && configFile?.projects?.[projectName]) {
    const projectConfig = configFile.projects[projectName];
    result = Object.assign(projectConfig!, configFile, result) as StormConfig;
  }

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
  projectName?: string,
  defaultConfig?: Partial<TConfig>
): Promise<TConfig> => {
  const cacheKey = [projectName, defaultConfig ?? {}];
  if (_config_cache.has(cacheKey)) {
    return _config_cache.get(cacheKey) as TConfig;
  }

  const config: StormConfig = Object.assign(
    (await getStaticConfig()) ?? ({} as TConfig),
    defaultConfig
  );
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
