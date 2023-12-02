import { loadStormConfig } from "../load-config";
import { StormConfig } from "../types";

/**
 * Sets the environment variables for the current process.
 *
 * @param defaultConfig - The default configuration to use if none is found.
 * @returns The loaded configuration.
 */
export const setEnv = async <TConfig extends StormConfig = StormConfig>(
  projectName?: string,
  defaultConfig?: Partial<TConfig>
): Promise<TConfig> => {
  const config = await loadStormConfig<TConfig>(projectName, defaultConfig);

  const env = flattenConfigProperties(config, "STORM");
  process.env.STORM_CONFIG ??= JSON.stringify(config);

  for (const key of Object.keys(env)) {
    process.env[key] ??= env[key];
  }

  // Handle extra env variables
  process.env.NODE_ENV ??= process.env.STORM_ENV;
  process.env.MODE ??= process.env.STORM_ENV;
  process.env.ENV ??= process.env.STORM_ENV;
  process.env.ENVIRONMENT ??= process.env.STORM_ENV;
  process.env.CI ??= process.env.STORM_CI;
  process.env.CONTINUOUS_INTEGRATION ??= process.env.STORM_CI;
  process.env.TZ ??= process.env.STORM_TIMEZONE;
  process.env.TIMEZONE ??= process.env.STORM_TIMEZONE;
  process.env.LOCALE ??= process.env.STORM_LOCALE;

  return config;
};

const flattenConfigProperties = (obj: any, prefix = "") => {
  const flattened: any = {};

  Object.keys(obj).forEach(key => {
    if (obj[key] && Object.keys(obj[key]).length > 0) {
      Object.assign(flattened, flattenConfigProperties(obj[key], prefix));
    } else {
      flattened[`${prefix}_${key}`.toUpperCase()] = obj[key];
    }
  });

  return flattened;
};
