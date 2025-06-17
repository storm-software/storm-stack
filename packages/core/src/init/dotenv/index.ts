/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { ENV_PREFIXES } from "@stryke/env/types";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isString } from "@stryke/type-checks/is-string";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import defu from "defu";
import type {
  Context,
  EngineHooks,
  Options,
  ResolvedDotenvOptions
} from "../../types/build";
import type { LogFn } from "../../types/config";
import { loadEnv } from "./load";
import { reflectDotenvTypes } from "./reflect";

export async function initDotenv<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the context for the Storm Stack project.`
  );

  context.dotenv ??= {} as ResolvedDotenvOptions;
  context.dotenv.types = await reflectDotenvTypes(log, context);
  context.dotenv.additionalFiles = context.dotenv?.additionalFiles ?? [];

  context.dotenv.prefix = !context.options.dotenv?.prefix
    ? []
    : typeof context.options.dotenv?.prefix === "string"
      ? [context.options.dotenv.prefix]
      : context.options.dotenv.prefix;
  context.dotenv.prefix = context.dotenv.prefix.reduce(
    (ret, prefix) => {
      const prefixName = prefix.replace(/_$/, "");
      if (prefixName && !ret.includes(prefixName)) {
        ret.push(prefixName);
      }

      return ret;
    },
    ENV_PREFIXES.map(prefix => prefix.replace(/_$/, ""))
  );

  context.dotenv.replace = Boolean(
    context.dotenv?.replace ?? context.options.projectType === "application"
  );

  const env = defu(
    await loadEnv(
      context.options,
      context.dotenv,
      context.envPaths.cache,
      context.envPaths.config,
      context.packageJson,
      context.workspaceConfig
    ),
    {
      APP_NAME: kebabCase(
        context.options.name ||
          context.packageJson.name?.replace(
            `/${context.workspaceConfig.namespace}`,
            ""
          )
      ),
      APP_VERSION: context.packageJson.version,
      BUILD_ID: context.meta.buildId,
      BUILD_TIMESTAMP: context.meta.timestamp,
      BUILD_CHECKSUM: context.meta.checksum,
      RELEASE_ID: context.meta.releaseId,
      RELEASE_TAG: `${kebabCase(context.options.name)}@${context.packageJson.version}`,
      MODE: context.options.mode,
      ORGANIZATION: context.workspaceConfig.organization,
      PLATFORM: context.options.platform,
      STACKTRACE: context.options.mode === "development",
      ENVIRONMENT: context.options.mode
    }
  );

  // Convert Storm-Ops log levels -> Storm Stack log levels
  if (env.LOG_LEVEL === "trace" || env.LOG_LEVEL === "all") {
    env.LOG_LEVEL = "debug";
  } else if (env.LOG_LEVEL === "success") {
    env.LOG_LEVEL = "info";
  } else if (env.LOG_LEVEL === "silent") {
    env.LOG_LEVEL = "fatal";
  }

  context.dotenv.values = Object.keys(env).reduce((ret, key) => {
    let value = env[key];
    if (isString(value)) {
      value = `"${value.replaceAll('"', "")}"`;
    } else if (!isUndefined(value)) {
      value = String(value);
    }

    ret[key.replaceAll("(", "").replaceAll(")", "")] = value;

    return ret;
  }, env);

  await hooks.callHook("init:dotenv", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the dotenv configuration for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the dotenv configuration for the Storm Stack project",
      { cause: error }
    );
  });

  log(
    LogLevelLabel.TRACE,
    "Initialized the dotenv configuration for the Storm Stack project."
  );
}
