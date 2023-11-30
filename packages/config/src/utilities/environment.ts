import { isSetString } from "@storm-software/utilities/type-checks/is-set-string";

/**
 * Checks if the current environment is production.
 *
 * @returns True if the current environment is production.
 */
export const isProduction = (): boolean =>
  isSetString(process.env.STORM_ENV)
    ? !!(process.env.STORM_ENV?.toLowerCase() === "production")
    : !!(process.env.NODE_ENV?.toLowerCase() === "production");

/**
 * Checks if the current environment is development.
 *
 * @returns True if the current environment is development.
 */
export const isDevelopment = (): boolean => !isProduction();
