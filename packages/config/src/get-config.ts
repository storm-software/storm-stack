import { Schema, wrap } from "@decs/typeschema";
import { deepMerge } from "@storm-software/utilities/helper-fns/deep-merge";
import { camelCase, constantCase } from "@storm-software/utilities/string-fns";
import { isSetString } from "@storm-software/utilities/type-checks";
import {
  ProjectConfig,
  StormConfig,
  wrapped_ProjectConfig,
  wrapped_StormConfig
} from "./types";

const _env_cache = new Map<string, Record<string, any>>();
const _module_cache = new WeakMap<
  { packageName?: string; moduleName: string },
  any
>();
let _static_cache: StormConfig | undefined = undefined;

const getConfigModuleEnv = <
  TConfig extends Record<string, any> = Record<string, any>
>(
  config: Partial<StormConfig>,
  moduleName: string,
  projectName?: string
): TConfig | undefined => {
  const prefix = `STORM${
    projectName ? `_${constantCase(projectName)}` : ""
  }_MODULE_${constantCase(moduleName)}_`;

  return Object.keys(process.env)
    .filter(key => key.startsWith(prefix))
    .reduce(
      (ret: Record<string, any>, key: string) => {
        const name = camelCase(key.replace(prefix, ""));
        isSetString(name) && (ret[name] = process.env[key]);

        return ret;
      },
      config.modules?.[moduleName] ?? {}
    ) as TConfig;
};

export const getPackageConfigEnv = (
  config: Partial<StormConfig>,
  packageName?: string
): Record<string, any> => {
  const prefix = `STORM_${
    constantCase(packageName) ? `PROJECT_${constantCase(packageName)}_` : ""
  }`;
  let packageConfig: Record<string, any> = {
    name: process.env[`${prefix}NAME`] ?? packageName,
    namespace: process.env[`${prefix}NAMESPACE`] ?? config.namespace,
    owner: process.env[`${prefix}OWNER`] ?? config.owner,
    worker: process.env[`${prefix}WORKER`] ?? config.worker,
    organization: process.env[`${prefix}ORGANIZATION`] ?? config.organization,
    license: process.env[`${prefix}LICENSE`] ?? config.license,
    homepage: process.env[`${prefix}HOMEPAGE`] ?? config.homepage,
    configFile: process.env[`${prefix}CONFIG_FILE`] ?? config.configFile,
    runtimeVersion:
      process.env[`${prefix}RUNTIME_VERSION`] ?? config.runtimeVersion,
    runtimeDirectory:
      process.env[`${prefix}RUNTIME_DIRECTORY`] ?? config.runtimeDirectory,
    environment:
      process.env[`${prefix}ENVIRONMENT`] ??
      process.env.NODE_ENV ??
      config.environment,
    colors: {
      primary: process.env[`${prefix}COLORS_PRIMARY`] ?? config.colors?.primary,
      background:
        process.env[`${prefix}COLORS_BACKGROUND`] ?? config.colors?.background,
      success: process.env[`${prefix}COLORS_SUCCESS`] ?? config.colors?.success,
      info: process.env[`${prefix}COLORS_INFO`] ?? config.colors?.info,
      warning: process.env[`${prefix}COLORS_WARNING`] ?? config.colors?.warning,
      error: process.env[`${prefix}COLORS_ERROR`] ?? config.colors?.error
    },
    repository: process.env[`${prefix}REPOSITORY`] ?? config.repository,
    branch: process.env[`${prefix}BRANCH`] ?? config.branch,
    preMajor: process.env[`${prefix}PRE_MAJOR`] ?? config.preMajor,
    modules: config.modules
  };

  const serializedConfig = process.env[`${prefix}CONFIGURATION`];
  if (serializedConfig) {
    packageConfig = deepMerge(packageConfig, JSON.parse(serializedConfig));
  }

  const modulePrefix = `STORM_${prefix}MODULE_`;
  return Object.keys(process.env)
    .filter(key => key.startsWith(modulePrefix))
    .reduce((ret: Record<string, any>, key: string) => {
      const module = camelCase(
        key.substring(prefix.length, key.indexOf("_", prefix.length))
      );
      isSetString(module) &&
        (ret.modules[module] = getConfigModuleEnv(config, module));

      return ret;
    }, packageConfig);
};

export const getProjectConfigEnv = async (
  config: Partial<StormConfig>,
  projectName: string
): Promise<ProjectConfig> => {
  if (_env_cache.has(projectName)) {
    return _env_cache.get(projectName) as ProjectConfig;
  }

  const result = await wrapped_ProjectConfig.parse(
    getPackageConfigEnv(config, projectName)
  );
  _env_cache.set(projectName, result);

  return result;
};

export const getStormConfig = async (): Promise<StormConfig> => {
  if (_static_cache) {
    return _static_cache;
  }

  let config = getPackageConfigEnv({});

  const prefix = "STORM_PROJECT_";
  const projects = await Promise.all(
    Object.keys(process.env)
      .filter(key => key.startsWith(prefix))
      .map((key: string) =>
        getProjectConfigEnv(
          config,
          camelCase(
            key.substring(prefix.length, key.indexOf("_", prefix.length))
          ) as string
        )
      )
  );

  config.projects = projects.reduce(
    (ret: Record<string, ProjectConfig>, project: ProjectConfig) => {
      ret[project.name] = project;
      return ret;
    },
    {}
  );

  const result = await wrapped_StormConfig.parse(config);
  _static_cache = result;

  return result;
};

/**
 * Get the config for a specific Storm config module
 *
 * @param moduleName - The name of the config module
 * @param options - The options for the config module
 * @returns The config for the specified Storm config module. If the module does not exist, `undefined` is returned.
 */
export const getConfigModule = async <TModule = any>(
  schema: Schema,
  moduleName: string,
  projectName?: string
): Promise<TModule> => {
  const module_cache_key = { projectName, moduleName };
  if (_module_cache.has(module_cache_key)) {
    return _module_cache.get(module_cache_key) as TModule;
  }

  let result = await getStormConfig();

  let module = projectName
    ? result?.projects?.[projectName]?.modules?.[moduleName]
    : result?.modules?.[moduleName];
  if (schema) {
    const wrapped = wrap(schema);
    module = (await wrapped.parse(module)) as TModule;
  }

  _module_cache.set(module_cache_key, module);
  return module;
};
