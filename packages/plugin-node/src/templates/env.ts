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
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { NodePluginContext } from "../types/plugin";

/**
 * Generates a TypeScript module that provides runtime environment information for a Storm Stack application.
 *
 * @param context - The plugin context containing configuration, metadata, and package information.
 * @returns A string containing the TypeScript source code for the environment module.
 *
 * @remarks
 * The generated module exposes detailed information about the application's runtime environment, including platform, color support, CI detection, and standardized paths for data, config, cache, logs, and temp files.
 *
 * The returned module includes the following properties:
 *
 * - `hasTTY`: Indicates if the current process has a TTY (interactive terminal) available.
 * - `isCI`: True if the application is running in a Continuous Integration (CI) environment.
 * - `mode`: The current runtime mode, such as "development", "staging", or "production".
 * - `environment`: The environment name as specified in the plugin context.
 * - `isProduction`: True if running in production mode.
 * - `isStaging`: True if running in staging mode.
 * - `isDevelopment`: True if running in development mode.
 * - `isDebug`: True if running in debug mode (typically development with debug enabled).
 * - `isTest`: True if running in test mode or under test conditions.
 * - `isMinimal`: True if running in a minimal environment (e.g., CI, test, or no TTY).
 * - `isWindows`: True if the runtime platform is Windows.
 * - `isLinux`: True if the runtime platform is Linux.
 * - `isMacOS`: True if the runtime platform is macOS.
 * - `isNode`: True if running in Node.js or a Node.js-compatible runtime.
 * - `isServer`: True if running in a server environment (Node.js or specified platform).
 * - `isInteractive`: True if the environment supports interactive input/output.
 * - `isUnicodeSupported`: True if the terminal supports Unicode characters.
 * - `isColorSupported`: True if the terminal supports colored output.
 * - `supportsColor`: An object describing the color support level for stdout and stderr streams.
 * - `organization`: The name of the organization maintaining the application.
 * - `name`: The application name.
 * - `packageName`: The package name from package.json or the application name.
 * - `version`: The current application version.
 * - `buildId`: The build identifier for the current release.
 * - `timestamp`: The build or release timestamp.
 * - `releaseId`: The release identifier.
 * - `releaseTag`: A tag combining the application name and version.
 * - `defaultLocale`: The default locale for the application.
 * - `defaultTimezone`: The default timezone for the application.
 * - `platform`: The runtime platform (e.g., "node", "web", etc.).
 * - `paths`: An object containing standardized paths for data, config, cache, logs, and temp files, adapted to the current OS and environment variables.
 *
 * @example
 * ```typescript
 * import { createEnvironment } from "./env";
 * const env = createEnvironment();
 * console.log(env.isProduction); // true or false
 * ```
 */
export function EnvModule(context: NodePluginContext) {
  const name = kebabCase(context.options.name).trim().replace(/\s+/g, "");
  const organization =
    context.options?.organization &&
    (isSetString(context.options?.organization) ||
      context.options?.organization?.name)
      ? kebabCase(
          isSetString(context.options?.organization)
            ? context.options.organization
            : context.options?.organization?.name
        )
          ?.trim()
          .replace(/\s+/g, "")
      : name;

  return `
/**
 * This module provides the runtime environment information for the Storm Stack application.
 *
 * @module storm:env
 */

${getFileHeader()}

import {
  StormNodeEnv,
  StormEnvPaths,
} from "@storm-stack/types/node/env";
import process from "node:process";
import os from "node:os";
import tty from "node:tty";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";

/**
 * Checks if a specific flag is present in the command line arguments.
 *
 * @see {@link https://github.com/sindresorhus/has-flag/blob/main/index.js}
 *
 * @param flag - The flag to check for, e.g., "color", "no-color".
 * @param argv - The command line arguments to check against. Defaults to global Deno args or process args.
 * @returns True if the flag is present, false otherwise.
 */
export function hasFlag(
  flag: string,
  argv: string[] = globalThis.Deno ? globalThis.Deno.args : process.argv
) {
	const position = argv.indexOf(flag.startsWith("-") ? "" : (flag.length === 1 ? "-" : "--") + flag);
  return position !== -1 && argv.indexOf("--") === -1 || position < argv.indexOf("--");
}

/** Detect if the runtime platform is Windows */
const isWindows = /^win/i.test(process.platform);

/**
 * Options for getting the color support level.
 */
export type GetColorSupportLevelOptions = {
  streamIsTTY?: boolean;
  sniffFlags?: boolean;
};

/**
 * Determines the color support level of the terminal.
 *
 * @param stream - The stream to check availability of (e.g., process.stdout).
 * @param options - Options for the color detection.
 * @returns The color support level (0 = no color, 1 = basic, 2 = 256 colors, 3 = true color).
 */
export function getColorSupportLevel(stream, options?: GetColorSupportLevelOptions) {
  const { streamIsTTY = true, sniffFlags = true } = options || {};
  const forceColorConfig = process.env.FORCE_COLOR;

  let forceColor: number | undefined = undefined;
  if (forceColorConfig !== undefined) {
    forceColor = !forceColorConfig
      ? 0
      : typeof forceColorConfig === "boolean"
      ? 1
      : typeof forceColorConfig === "number" &&
        [0, 1, 2, 3].includes(Math.min(forceColorConfig as number, 3))
      ? Math.min(forceColorConfig as number, 3)
      : undefined;
  }

  if (sniffFlags !== false && forceColor === undefined) {
    forceColor = hasFlag("no-color") ||
      hasFlag("no-colors") ||
      hasFlag("color=false") ||
      hasFlag("color=never")
    ? 0
    : hasFlag("color") ||
      hasFlag("colors") ||
      hasFlag("color=true") ||
      hasFlag("color=always")
    ? 1
    : 0;
  }

  if (forceColor === 0) {
		return 0;
	}

	if (sniffFlags) {
		if (hasFlag("color=16m") ||
			hasFlag("color=full") ||
			hasFlag("color=truecolor")) {
			return 3;
		}

		if (hasFlag("color=256")) {
			return 2;
		}
	}

  const level = Boolean(process.env.TF_BUILD) || Boolean(process.env.AGENT_NAME)
    ? 1
    : stream &&
        !(streamIsTTY || (stream && stream.isTTY)) &&
        forceColor === undefined
      ? 0
      : process.env.TERM === "dumb"
        ? forceColor || 0
        : isWindows
          ? Number(os.release().split(".")[0]) >= 10 &&
            Number(os.release().split(".")[2]) >= 10_586
            ? Number(os.release().split(".")[2]) >= 14_931
              ? 3
              : 2
            : 1
          : Boolean(process.env.CI)
            ? Boolean(process.env.GITHUB_ACTIONS) ||
              Boolean(process.env.GITEA_ACTIONS) ||
              Boolean(process.env.CIRCLECI)
              ? 3
              : Boolean(process.env.TRAVIS) ||
                Boolean(process.env.APPVEYOR) ||
                Boolean(process.env.GITLAB_CI) ||
                Boolean(process.env.BUILDKITE) ||
                Boolean(process.env.DRONE) ||
                process.env.CI_NAME === "codeship"
                ? 1
                : forceColor || 0
            : Boolean(process.env.TEAMCITY_VERSION)
              ? /^(?:9\.0*[1-9]\d*\.|\d{2,}\.)/.test(String(process.env.TEAMCITY_VERSION) || "")
                ? 1
                : 0
              : String(process.env.COLORTERM) === "truecolor" ||
                  process.env.TERM === "xterm-kitty"
                ? 3
                : Boolean(process.env.TERM_PROGRAM)
                  ? process.env.TERM_PROGRAM === "iTerm.app"
                    ? Number.parseInt(
                        (process.env.TERM_PROGRAM_VERSION || "").split(".")[0] as string,
                        10
                      ) >= 3
                      ? 3
                      : 2
                    : process.env.TERM_PROGRAM === "Apple_Terminal"
                      ? 2
                      : 0
                  : /-256(?:color)?$/i.test(process.env.TERM || "")
                    ? 2
                    : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
                          process.env.TERM || ""
                        )
                      ? 1
                      : Boolean(process.env.COLORTERM);

	return typeof level === "boolean" || level === 0
    ? false
    : {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3,
	    };
}

/**
 * Generate a list of variables that describe the current application's runtime environment.
 *
 * @returns An object containing the runtime environment details.
 */
export function createEnv(): StormNodeEnv {
  /** Detect if stdout.TTY is available */
  const hasTTY = Boolean(process.stdout && process.stdout.isTTY);

  /** Detect if the application is running in a CI environment */
  const isCI = Boolean(
    process.env.CI ||
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
    process.env.XCS || false
  );

  /**
   * Detect the \`mode\` of the current runtime environment.
   *
   * @remarks
   * The \`mode\` is determined by the \`MODE\` environment variable, or falls back to the \`NEXT_PUBLIC_VERCEL_ENV\`, \`NODE_ENV\`, or defaults to \`production\`. While the value can potentially be any string, Storm Software generally only allows a value in the following list:
   * - \`production\`
   * - \`staging\`
   * - \`development\`
   */
  const mode = String($storm.config.MODE) ||
    "production";

  /** Detect if the application is running in production mode */
  const isProduction = ["prd", "prod", "production"].includes(
    mode.toLowerCase()
  );

  /** Detect if the application is running in staging mode */
  const isStaging = ["stg", "stage", "staging"].includes(
    mode.toLowerCase()
  );

  /** Detect if the application is running in development mode */
  const isDevelopment = ["dev", "development"].includes(
    mode.toLowerCase()
  );

  /** Detect if the application is running in debug mode */
  const isDebug = Boolean(
    isDevelopment && $storm.config.DEBUG
  );

  /** Detect if the application is running in test mode */
  const isTest =
    Boolean(
      ["tst", "test", "testing"].includes(mode.toLowerCase()) ||
      $storm.config.TEST
    );

  /** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
  const isMinimal = Boolean(
    process.env.MINIMAL || isCI || isTest || !hasTTY
  );

  /** Detect if the runtime platform is Linux */
  const isLinux = /^linux/i.test(process.platform);

  /** Detect if the runtime platform is macOS (darwin kernel) */
  const isMacOS = /^darwin/i.test(process.platform);

  /** Detect if the runtime platform is interactive */
  const isInteractive = Boolean(
    !isMinimal && process.stdin?.isTTY && process.env.TERM !== "dumb"
  );

  /** Detect if Unicode characters are supported */
  const isUnicodeSupported = Boolean(
    !isWindows
      ? process.env.TERM !== "linux"
      : (
          Boolean(process.env.WT_SESSION) ||
          Boolean(process.env.TERMINUS_SUBLIME) ||
          process.env.ConEmuTask === "{cmd::Cmder}" ||
          process.env.TERM_PROGRAM === "Terminus-Sublime" ||
          process.env.TERM_PROGRAM === "vscode" ||
          process.env.TERM === "xterm-256color" ||
          process.env.TERM === "alacritty" ||
          process.env.TERM === "rxvt-unicode" ||
          process.env.TERM === "rxvt-unicode-256color" ||
          process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
        )
  );

  /**
   * Detect if color is supported
   */
  const isColorSupported = Boolean(
    !hasFlag("no-color") &&
    !hasFlag("no-colors") &&
    !hasFlag("color=false") &&
    !hasFlag("color=never") &&
    !process.env.NO_COLOR &&
    (hasFlag("color") ||
        hasFlag("colors") ||
        hasFlag("color=true") ||
        hasFlag("color=always") ||
        process.env.FORCE_COLOR) ||
        ((hasTTY || isWindows) && process.env.TERM !== "dumb")
  );

  const supportsColor = {
    stdout: getColorSupportLevel({ isTTY: tty.isatty(1) }),
    stderr: getColorSupportLevel({ isTTY: tty.isatty(2) }),
  };

  /**
   * Indicates if running in Node.js or a Node.js compatible runtime.
   *
   * @remarks
   * When running code in Bun and Deno with Node.js compatibility mode, \`isNode\` flag will be also \`true\`, indicating running in a Node.js compatible runtime.
   */
  const isNode = globalThis.process?.release?.name === "node";

  /** The organization that maintains the application */
  const organization = "${organization}";

  /**
   * The current application name
   */
  const name = "${name}";

  /**
   * The current application version
   */
  const version = "${
    context.packageJson?.version
      ? context.packageJson.version
      : "$storm.config.APP_VERSION"
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
   * If the \`DATA_DIR\`, \`CONFIG_DIR\`, \`CACHE_DIR\`, \`LOG_DIR\`, or \`TEMP_DIR\` environment variables are set, they will be used instead of the default paths.
   */
  const paths = isMacOS
    ? {
      data: String($storm.config.DATA_DIR)
        ? join(String($storm.config.DATA_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Application Support", "${titleCase(organization)}", "${titleCase(name)}"),
      config: String($storm.config.CONFIG_DIR)
        ? join(String($storm.config.CONFIG_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Preferences", "${titleCase(organization)}", "${titleCase(name)}"),
      cache: String($storm.config.CACHE_DIR)
        ? join(String($storm.config.CACHE_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Caches", "${titleCase(organization)}", "${titleCase(name)}"),
      log: String($storm.config.LOG_DIR)
        ? join(String($storm.config.LOG_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Logs", "${titleCase(organization)}", "${titleCase(name)}"),
      temp: String($storm.config.TEMP_DIR)
        ? join(String($storm.config.TEMP_DIR), "${titleCase(name)}")
        : join(tmpdir, "${titleCase(organization)}", "${titleCase(name)}")
    }
      : isWindows
    ? {
      data: String($storm.config.DATA_DIR)
        ? join(String($storm.config.DATA_DIR), "${titleCase(name)}")
        : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Data"),
      config: String($storm.config.CONFIG_DIR)
        ? join($storm.config.CONFIG_DIR!, "${titleCase(name)}")
        : join(process.env.APPDATA || join(homedir, "AppData", "Roaming"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Config"),
      cache: String($storm.config.CACHE_DIR)
        ? join(String($storm.config.CACHE_DIR), "${titleCase(name)}")
        : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "Cache", "${titleCase(organization)}", "${titleCase(
          name
        )}"),
      log: String($storm.config.LOG_DIR)
        ? join(String($storm.config.LOG_DIR), "${titleCase(name)}")
        : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Log"),
      temp: String($storm.config.TEMP_DIR)
        ? join(String($storm.config.TEMP_DIR), "${titleCase(name)}")
        : join(tmpdir, "${titleCase(organization)}", "${titleCase(name)}")
    }
      :
    {
      data: String($storm.config.DATA_DIR)
        ? join(String($storm.config.DATA_DIR), "${kebabCase(name)}")
        : join(
            process.env.XDG_DATA_HOME || join(homedir, ".local", "share"),
            "${kebabCase(organization)}",
            "${kebabCase(name)}"
          ),
      config: String($storm.config.CONFIG_DIR)
        ? join(String($storm.config.CONFIG_DIR), "${kebabCase(name)}")
        : join(
            process.env.XDG_CONFIG_HOME || join(homedir, ".config"),
            "${kebabCase(organization)}",
            "${kebabCase(name)}"
          ),
      cache: String($storm.config.CACHE_DIR)
        ? join(String($storm.config.CACHE_DIR), "${kebabCase(name)}")
        : join(process.env.XDG_CACHE_HOME || join(homedir, ".cache"), "${kebabCase(organization)}", "${kebabCase(
          name
        )}"),
      log: String($storm.config.LOG_DIR)
        ? join(String($storm.config.LOG_DIR), "${kebabCase(name)}")
        : join(process.env.XDG_STATE_HOME || join(homedir, ".local", "state"), "${kebabCase(organization)}", "${kebabCase(
          name
        )}"),
      temp: String($storm.config.TEMP_DIR)
        ? join(String($storm.config.TEMP_DIR), "${kebabCase(name)}")
        : (process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR
            ? join((process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR)!, "${kebabCase(organization)}", "${kebabCase(
              name
            )}")
            : join(tmpdir, basename(homedir), "${kebabCase(organization)}", "${kebabCase(name)}"))
  } as StormEnvPaths;

  return {
    hasTTY,
    isCI,
    mode: isDevelopment ? "development" : isStaging ? "staging" : "production",
    environment: "${context.options.environment}",
    isProduction,
    isStaging,
    isDevelopment,
    isDebug,
    isTest,
    isMinimal,
    isWindows,
    isLinux,
    isMacOS,
    isNode,
    isServer: isNode || "${context.options.platform}" === "node",
    isInteractive,
    isUnicodeSupported,
    isColorSupported,
    supportsColor,
    organization,
    name,
    packageName: "${context.packageJson?.name || name}",
    version,
    buildId: "${context.meta.buildId}",
    timestamp: ${context.meta.timestamp},
    releaseId: "${context.meta.releaseId}",
    releaseTag: \`${name}@\${version}\`,
    defaultLocale: $storm.config.DEFAULT_LOCALE!,
    defaultTimezone: $storm.config.DEFAULT_TIMEZONE!,
    platform: "${context.options.platform}" as "node" | "neutral" | "browser",
    paths
  };
}

`;
}
