/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context, Options } from "../../../types/build";

export function writeEnv<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import type {
  StormBuildInfo,
  StormRuntimeInfo,
  StormRuntimePaths
} from "@storm-stack/types/node/env";
import os from "node:os";
import { join, basename } from "node:path";

/** Detect if stdout.TTY is available */
export const hasTTY = Boolean(process.stdout && process.stdout.isTTY);

/** Detect if the application is running in a CI environment */
export const isCI = Boolean(
  process.env.STORM_CI ||
  process.env.CI ||
  process.env.CONTINUOUS_INTEGRATION ||
  process.env.RUN_ID ||
  process.env.AGOLA_GIT_REF ||
  process.env.AC_APPCIRCLE ||
  process.env.APPVEYOR ||
  process.env.CODEBUILD ||
  process.env.TF_BUILD ||
  process.env.bamboo_planKey ||
  process.env.BITBUCKET_COMMIT ||
  process.env.BITRISE_IO ||
  process.env.BUDDY_WORKSPACE_ID ||
  process.env.BUILDKITE ||
  process.env.CIRCLECI ||
  process.env.CIRRUS_CI ||
  process.env.CF_BUILD_ID ||
  process.env.CM_BUILD_ID ||
  process.env.CI_NAME ||
  process.env.DRONE ||
  process.env.DSARI ||
  process.env.EARTHLY_CI ||
  process.env.EAS_BUILD ||
  process.env.GERRIT_PROJECT ||
  process.env.GITEA_ACTIONS ||
  process.env.GITHUB_ACTIONS ||
  process.env.GITLAB_CI ||
  process.env.GOCD ||
  process.env.BUILDER_OUTPUT ||
  process.env.HARNESS_BUILD_ID ||
  process.env.JENKINS_URL ||
  process.env.LAYERCI ||
  process.env.MAGNUM ||
  process.env.NETLIFY ||
  process.env.NEVERCODE ||
  process.env.PROW_JOB_ID ||
  process.env.RELEASE_BUILD_ID ||
  process.env.RENDER ||
  process.env.SAILCI ||
  process.env.HUDSON ||
  process.env.SCREWDRIVER ||
  process.env.SEMAPHORE ||
  process.env.SOURCEHUT ||
  process.env.STRIDER ||
  process.env.TASK_ID ||
  process.env.RUN_ID ||
  process.env.TEAMCITY_VERSION ||
  process.env.TRAVIS ||
  process.env.VELA ||
  process.env.NOW_BUILDER ||
  process.env.APPCENTER_BUILD_ID ||
  process.env.CI_XCODE_PROJECT ||
  process.env.XCS ||
  false);

/** Detect the \`NODE_ENV\` environment variable */
export const mode =
  $storm.vars.MODE ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.NODE_ENV ||
  "production";

/** Detect if the application is running in production mode */
export const isProduction = ["prd", "prod", "production"].includes(
  mode.toLowerCase()
);

/** Detect if the application is running in staging mode */
export const isStaging = ["stg", "stage", "staging"].includes(
  mode.toLowerCase()
);

/** Detect if the application is running in development mode */
export const isDevelopment = ["dev", "development"].includes(
  mode.toLowerCase()
);

/** Detect if the application is running in debug mode */
export const isDebug = isDevelopment && Boolean(process.env.DEBUG);

/** Detect if the application is running in test mode */
export const isTest =
  isDevelopment ||
  isStaging ||
  ["tst", "test", "testing"].includes(mode.toLowerCase()) ||
  Boolean(process.env.TEST);

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal =
  Boolean(process.env.MINIMAL) || isCI || isTest || !hasTTY;

/** Detect if the runtime platform is Windows */
export const isWindows = /^win/i.test(process.platform);

/** Detect if the runtime platform is Linux */
export const isLinux = /^linux/i.test(process.platform);

/** Detect if the runtime platform is macOS (darwin kernel) */
export const isMacOS = /^darwin/i.test(process.platform);

/** Detect if the runtime platform is interactive */
export const isInteractive = !isMinimal && Boolean(process.stdin?.isTTY && process.env.TERM !== "dumb")

/** Detect if Unicode characters are supported */
export const isUnicodeSupported = process.platform !== 'win32'
    ? process.env.TERM !== 'linux'
    : (Boolean(process.env.WT_SESSION)
        || Boolean(process.env.TERMINUS_SUBLIME)
        || process.env.ConEmuTask === '{cmd::Cmder}'
        || process.env.TERM_PROGRAM === 'Terminus-Sublime'
        || process.env.TERM_PROGRAM === 'vscode'
        || process.env.TERM === 'xterm-256color'
        || process.env.TERM === 'alacritty'
        || process.env.TERM === 'rxvt-unicode'
        || process.env.TERM === 'rxvt-unicode-256color'
        || process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm');

/** Detect if color is supported */
export const isColorSupported =
  !process.env.NO_COLOR &&
  (Boolean(process.env.FORCE_COLOR) ||
    ((hasTTY || isWindows) &&
      process.env.TERM !== "dumb"));

/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * @remarks
 * When running code in Bun and Deno with Node.js compatibility mode, \`isNode\` flag will be also \`true\`, indicating running in a Node.js compatible runtime.
 */
export const isNode = globalThis.process?.release?.name === "node";

/** The organization that maintains the application */
export const organization = "${
    context.workspaceConfig?.organization
      ? kebabCase(context.workspaceConfig?.organization)
          .trim()
          .replace(/\s+/g, "")
      : "$storm.vars.ORGANIZATION"
  }" || "storm-software";

/** The current application */
export const appName = "${
    context.options.name
      ? kebabCase(context.options.name).trim().replace(/\s+/g, "")
      : "$storm.vars.APP_NAME"
  }";
/** The current application */
export const appVersion = "${
    context.packageJson?.version
      ? context.packageJson.version
      : "$storm.vars.APP_VERSION"
  }";

const homedir = os.homedir();
const tmpdir = os.tmpdir();

/**
 * The environment paths for storing things like data, config, logs, and cache in the current runtime environment.
 *
 * @remarks
 * On macOS, directories are generally created in \`~/Library/Application Support/<name>\`.
 * On Windows, directories are generally created in \`%AppData%/<name>\`.
 * On Linux, directories are generally created in \`~/.config/<name>\` - this is determined via the [XDG Base Directory spec](https://specifications.freedesktop.org/basedir-spec/latest/).
 *
 * If the \`STORM_DATA_DIR\`, \`STORM_CONFIG_DIR\`, \`STORM_CACHE_DIR\`, \`STORM_LOG_DIR\`, or \`STORM_TEMP_DIR\` environment variables are set, they will be used instead of the default paths.
 */
export const paths = isMacOS
  ? {
    data: process.env.STORM_DATA_DIR
      ? join(process.env.STORM_DATA_DIR, appName)
      : join(homedir, "Library", "Application Support", organization, appName),
    config: process.env.STORM_CONFIG_DIR
      ? join(process.env.STORM_CONFIG_DIR, appName)
      : join(homedir, "Library", "Preferences", organization, appName),
    cache: process.env.STORM_CACHE_DIR
      ? join(process.env.STORM_CACHE_DIR, appName)
      : join(homedir, "Library", "Caches", organization, appName),
    log: process.env.STORM_LOG_DIR
      ? join(process.env.STORM_LOG_DIR, appName)
      : join(homedir, "Library", "Logs", organization, appName),
    temp: process.env.STORM_TEMP_DIR
      ? join(process.env.STORM_TEMP_DIR, appName)
      : join(tmpdir, organization, appName)
  }
    : isWindows
  ? {
    data: process.env.STORM_DATA_DIR
      ? join(process.env.STORM_DATA_DIR, appName)
      : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(
        context.workspaceConfig?.organization || "storm-software"
      )
        .trim()
        .replace(/\s+/g, "")}", "${titleCase(
        context.options.name || "storm-stack"
      )
        .trim()
        .replace(/\s+/g, "")}", "Data"),
    config: process.env.STORM_CONFIG_DIR
      ? join(process.env.STORM_CONFIG_DIR, appName)
      : join(process.env.APPDATA || join(homedir, "AppData", "Roaming"), "${titleCase(
        context.workspaceConfig?.organization || "storm-software"
      )
        .trim()
        .replace(/\s+/g, "")}", "${titleCase(
        context.options.name || "storm-stack"
      )
        .trim()
        .replace(/\s+/g, "")}", "Config"),
    cache: process.env.STORM_CACHE_DIR
      ? join(process.env.STORM_CACHE_DIR, appName)
      : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "Cache", "${titleCase(
        context.workspaceConfig?.organization || "storm-software"
      )
        .trim()
        .replace(/\s+/g, "")}"),
    log: process.env.STORM_LOG_DIR
      ? join(process.env.STORM_LOG_DIR, appName)
      : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(
        context.workspaceConfig?.organization || "storm-software"
      )
        .trim()
        .replace(/\s+/g, "")}", "${titleCase(
        context.options.name || "storm-stack"
      )
        .trim()
        .replace(/\s+/g, "")}", "Log"),
    temp: process.env.STORM_TEMP_DIR
      ? join(process.env.STORM_TEMP_DIR, appName)
      : join(tmpdir, "${titleCase(
        context.workspaceConfig?.organization || "storm-software"
      )
        .trim()
        .replace(/\s+/g, "")}", "${titleCase(
        context.options.name || "storm-stack"
      )
        .trim()
        .replace(/\s+/g, "")}")
  }
    :
  {
    data: process.env.STORM_DATA_DIR
      ? join(process.env.STORM_DATA_DIR, appName)
      : join(
          process.env.XDG_DATA_HOME || join(homedir, ".local", "share"),
          organization,
          appName
        ),
    config: process.env.STORM_CONFIG_DIR
      ? join(process.env.STORM_CONFIG_DIR, appName)
      : join(
          process.env.XDG_CONFIG_HOME || join(homedir, ".config"),
          organization,
          appName
        ),
    cache: process.env.STORM_CACHE_DIR
      ? join(process.env.STORM_CACHE_DIR, appName)
      : join(
          process.env.XDG_CACHE_HOME || join(homedir, ".cache"),
          organization,
          appName
        ),
    log: join(
      process.env.XDG_STATE_HOME || join(homedir, ".local", "state"),
      organization,
      appName
    ),
    temp: process.env.STORM_TEMP_DIR
      ? join(process.env.STORM_TEMP_DIR, appName)
      : (process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR
        ? join(
            (process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR)!,
            organization,
            appName
          )
        : join(tmpdir, basename(homedir), organization, appName))
  } as StormEnvPaths;

/** The static build information collection */
export const build = {
  packageName: "${context.packageJson?.name || context.options.name}",
  organization,
  buildId: $storm.vars.BUILD_ID!,
  timestamp: $storm.vars.BUILD_TIMESTAMP
    ? Number($storm.vars.BUILD_TIMESTAMP)
    : 0,
  releaseId: $storm.vars.RELEASE_ID!,
  releaseTag: $storm.vars.RELEASE_TAG!,
  mode,
  platform: ($storm.vars.PLATFORM || "node") as StormBuildInfo["platform"],
  isProduction,
  isStaging,
  isDevelopment
} as StormBuildInfo;

/** The dynamic runtime information collection */
export const runtime = {
  isTest,
  isDebug,
  isNode,
  hasTTY,
  isWindows,
  isLinux,
  isMacOS,
  isCI,
  isInteractive,
  isMinimal,
  isColorSupported,
  isUnicodeSupported,
  isServer: isNode || build.platform === "node"
} as StormRuntimeInfo;

`;
}
