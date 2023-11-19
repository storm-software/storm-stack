import { Schema, wrap } from "@decs/typeschema";
import { deepMerge } from "@storm-software/utilities/helper-fns/deep-merge";
import { isSetObject } from "@storm-software/utilities/type-checks/is-set-object";
import { DeepPartial } from "@storm-software/utilities/types";
import { CosmiconfigResult, cosmiconfig } from "cosmiconfig";
import { getDefaultConfig } from "./default-config";
import {
  ProjectConfig,
  StormConfig,
  ThemeConfig,
  wrapped_StormConfig
} from "./types";

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
    result = deepMerge(
      defaultConfig,
      await wrapped_StormConfig.parse(
        (await wrapped_StormConfig.parse(
          configFile.config
        )) as Partial<StormConfig>
      )
    );
  }

  result && (result.configFilepath = configFile.filepath);
  _static_cache = result;

  return result;
};

/**
 * Get the config for the current Storm workspace
 *
 * @param defaultConfig - The default config to apply under the current workspace config
 * @returns The config for the current Storm workspace
 */
export const getStormConfig = async <TConfig extends StormConfig = StormConfig>(
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

/**
 * Get the config for a specific Storm project
 *
 * @param projectName - The name of the project
 * @param options - The options for the project config
 * @returns The config for the specified Storm project. If the project does not exist, `undefined` is returned.
 */
export const getProjectConfig = async <
  TConfig extends ProjectConfig = ProjectConfig
>(
  projectName: string,
  options: {
    defaultConfig?: DeepPartial<TConfig>;
  } = {}
): Promise<TConfig | undefined> => {
  const result = await getStormConfig<StormConfig>({
    workspace: {
      projects: {
        [projectName]: options.defaultConfig
      }
    }
  });

  return result.workspace.projects[projectName] as TConfig;
};

/**
 * Get the config for a specific Storm config module
 *
 * @param moduleName - The name of the config module
 * @param options - The options for the config module
 * @returns The config for the specified Storm config module. If the module does not exist, `undefined` is returned.
 */
export const getConfigModule = async <TModule = any>(
  moduleName: string,
  options: {
    defaultConfig?: DeepPartial<TModule>;
    schema?: Schema;
  } = {}
): Promise<TModule | undefined> => {
  let result = await getStormConfig({
    workspace: {
      modules: {
        [moduleName]: options?.defaultConfig
      }
    }
  });

  if (options.schema) {
    const schema = wrap(options.schema);
    return (await schema.parse(
      result.workspace.modules[moduleName]
    )) as TModule;
  }

  return result.workspace.modules[moduleName] as TModule;
};

export const getTheme = async (
  projectName?: string
): Promise<ThemeConfig | undefined> => {
  let result = await getStormConfig();

  return projectName && result.workspace.projects[projectName]?.theme
    ? result.workspace.projects[projectName]?.theme
    : result.workspace.theme;
};
