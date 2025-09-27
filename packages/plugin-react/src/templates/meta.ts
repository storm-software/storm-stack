/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { ReactPluginContext } from "../types/plugin";

export function MetaModule(context: ReactPluginContext) {
  const name = kebabCase(context.options.name).trim().replace(/\s+/g, "");
  const organization =
    context.options?.workspaceConfig?.organization &&
    (isSetString(context.options?.workspaceConfig?.organization) ||
      context.options?.workspaceConfig?.organization?.name)
      ? kebabCase(
          isSetString(context.options?.workspaceConfig?.organization)
            ? context.options.workspaceConfig.organization
            : context.options.workspaceConfig?.organization?.name
        )
          ?.trim()
          .replace(/\s+/g, "")
      : name;

  return `
/**
 * This module provides the runtime metadata information for the Storm Stack application.
 *
 * @module storm:meta
 */

${getFileHeader()}

/**
 * Detect the \`mode\` of the current runtime environment.
 *
 * @remarks
 * The \`mode\` is determined by the \`MODE\` environment variable, or falls back to the \`NEXT_PUBLIC_VERCEL_ENV\`, \`NODE_ENV\`, or defaults to \`production\`. While the value can potentially be any string, Storm Software generally only allows a value in the following list:
 * - \`production\`
 * - \`test\`
 * - \`development\`
 */
export const mode = "${context.options.mode}" as "production" | "test" | "development";

/** Detect if the application is running in "production" mode */
export const isProduction = ["prd", "prod", "production"].includes(
  mode.toLowerCase()
);

/** Detect if the application is running in "test" mode */
export const isTest = Boolean(
  ["tst", "test", "testing", "stg", "stage", "staging"].includes(mode.toLowerCase()) ||
  $storm.env.TEST
);

/** Detect if the application is running in "development" mode */
export const isDevelopment = ["dev", "development"].includes(
  mode.toLowerCase()
);

/** Detect if the application is running in debug mode */
export const isDebug = Boolean(
  isDevelopment && $storm.env.DEBUG
);

/** Determine if the application is running on the server */
export const isServer = ${context.options.platform === "node" ? "true" : "false"};

/** The organization that maintains the application */
export const organization = "${organization}";

/**
 * The current application name
 */
export const name = "${name}";

/**
 * The current application version
 */
export const version = "${
    context.packageJson?.version
      ? context.packageJson.version
      : "$storm.env.APP_VERSION"
  }";

/**
 * The current application environment
 */
export const environment = "${context.options.environment}";

/** Detect if the application is running in debug mode */
export const defaultLocale = $storm.env.DEFAULT_LOCALE;

/** Detect if the application is running in debug mode */
export const defaultTimezone = $storm.env.DEFAULT_TIMEZONE;

/**
 * A gating function to determine if the optimized [React compiler](https://react.dev/reference/react-compiler) source code should be used.
 *
 * @see https://react.dev/reference/react-compiler/gating
 *
 * @returns A boolean indicating if the React compiler should be used.
 */
export function shouldUseOptimizedReact() {
  return !$storm.env.DISABLE_REACT_COMPILER && !isDevelopment;
}

`;
}
