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
export function MetaModule(context: NodePluginContext) {
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

import {
  StormNodeMeta,
  StormEnvPaths,
} from "@storm-stack/core/runtime-types/node/meta";
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
  isTTY?: boolean;
  sniffFlags?: boolean;
};

/**
 * Determines the color support level of the terminal.
 *
 * @param stream - The stream to check availability of (e.g., process.stdout).
 * @param options - Options for the color detection.
 * @returns The color support level (0 = no color, 1 = basic, 2 = 256 colors, 3 = true color).
 */
export function getColorSupportLevel(
  stream: NodeJS.WriteStream & {
    fd: 1 | 2;
  },
  options: GetColorSupportLevelOptions = {}
) {
  const { isTTY = true, sniffFlags = true } = options;
  const forceColorConfig = $storm.env.FORCE_COLOR;

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

  const level = Boolean($storm.env.TF_BUILD) || Boolean($storm.env.AGENT_NAME)
    ? 1
    : stream &&
        !(isTTY || (stream && stream.isTTY)) &&
        forceColor === undefined
      ? 0
      : $storm.env.TERM === "dumb"
        ? forceColor || 0
        : isWindows
          ? Number(os.release().split(".")[0]) >= 10 &&
            Number(os.release().split(".")[2]) >= 10_586
            ? Number(os.release().split(".")[2]) >= 14_931
              ? 3
              : 2
            : 1
          : Boolean($storm.env.CI)
            ? Boolean($storm.env.GITHUB_ACTIONS) ||
              Boolean($storm.env.GITEA_ACTIONS) ||
              Boolean($storm.env.CIRCLECI)
              ? 3
              : Boolean($storm.env.TRAVIS) ||
                Boolean($storm.env.APPVEYOR) ||
                Boolean($storm.env.GITLAB_CI) ||
                Boolean($storm.env.BUILDKITE) ||
                Boolean($storm.env.DRONE) ||
                $storm.env.CI_NAME === "codeship"
                ? 1
                : forceColor || 0
            : Boolean($storm.env.TEAMCITY_VERSION)
              ? /^(?:9\.0*[1-9]\d*\.|\d{2,}\.)/.test(String($storm.env.TEAMCITY_VERSION) || "")
                ? 1
                : 0
              : String($storm.env.COLORTERM) === "truecolor" ||
                  $storm.env.TERM === "xterm-kitty"
                ? 3
                : Boolean($storm.env.TERM_PROGRAM)
                  ? $storm.env.TERM_PROGRAM === "iTerm.app"
                    ? Number.parseInt(
                        ($storm.env.TERM_PROGRAM_VERSION || "").split(".")[0] as string,
                        10
                      ) >= 3
                      ? 3
                      : 2
                    : $storm.env.TERM_PROGRAM === "Apple_Terminal"
                      ? 2
                      : 0
                  : /-256(?:color)?$/i.test($storm.env.TERM || "")
                    ? 2
                    : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
                          $storm.env.TERM || ""
                        )
                      ? 1
                      : Boolean($storm.env.COLORTERM);

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
 * Generate a list of variables that describe the current application's runtime metadata.
 *
 * @returns An object containing the runtime metadata details.
 */
export function createMeta(): StormNodeMeta {
  /** Detect if stdout.TTY is available */
  const hasTTY = Boolean(process.stdout && process.stdout.isTTY);

  /** Detect if the application is running in a CI environment */
  const isCI = Boolean(
    $storm.env.CI ||
    $storm.env.RUN_ID ||
    $storm.env.AGOLA_GIT_REF ||
    $storm.env.AC_APPCIRCLE ||
    $storm.env.APPVEYOR ||
    $storm.env.CODEBUILD ||
    $storm.env.TF_BUILD ||
    $storm.env.bamboo_planKey ||
    $storm.env.BITBUCKET_COMMIT ||
    $storm.env.BITRISE_IO ||
    $storm.env.BUDDY_WORKSPACE_ID ||
    $storm.env.BUILDKITE ||
    $storm.env.CIRCLECI ||
    $storm.env.CIRRUS_CI ||
    $storm.env.CF_BUILD_ID ||
    $storm.env.CM_BUILD_ID ||
    $storm.env.CI_NAME ||
    $storm.env.DRONE ||
    $storm.env.DSARI ||
    $storm.env.EARTHLY_CI ||
    $storm.env.EAS_BUILD ||
    $storm.env.GERRIT_PROJECT ||
    $storm.env.GITEA_ACTIONS ||
    $storm.env.GITHUB_ACTIONS ||
    $storm.env.GITLAB_CI ||
    $storm.env.GOCD ||
    $storm.env.BUILDER_OUTPUT ||
    $storm.env.HARNESS_BUILD_ID ||
    $storm.env.JENKINS_URL ||
    $storm.env.LAYERCI ||
    $storm.env.MAGNUM ||
    $storm.env.NETLIFY ||
    $storm.env.NEVERCODE ||
    $storm.env.PROW_JOB_ID ||
    $storm.env.RELEASE_BUILD_ID ||
    $storm.env.RENDER ||
    $storm.env.SAILCI ||
    $storm.env.HUDSON ||
    $storm.env.SCREWDRIVER ||
    $storm.env.SEMAPHORE ||
    $storm.env.SOURCEHUT ||
    $storm.env.STRIDER ||
    $storm.env.TASK_ID ||
    $storm.env.RUN_ID ||
    $storm.env.TEAMCITY_VERSION ||
    $storm.env.TRAVIS ||
    $storm.env.VELA ||
    $storm.env.NOW_BUILDER ||
    $storm.env.APPCENTER_BUILD_ID ||
    $storm.env.CI_XCODE_PROJECT ||
    $storm.env.XCS || false
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
  const mode = String($storm.env.MODE) ||
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
    isDevelopment && $storm.env.DEBUG
  );

  /** Detect if the application is running in test mode */
  const isTest =
    Boolean(
      ["tst", "test", "testing"].includes(mode.toLowerCase()) ||
      $storm.env.TEST
    );

  /** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
  const isMinimal = Boolean(
    $storm.env.MINIMAL || isCI || isTest || !hasTTY
  );

  /** Detect if the runtime platform is Linux */
  const isLinux = /^linux/i.test(process.platform);

  /** Detect if the runtime platform is macOS (darwin kernel) */
  const isMacOS = /^darwin/i.test(process.platform);

  /** Detect if the runtime platform is interactive */
  const isInteractive = Boolean(
    !isMinimal && process.stdin?.isTTY && $storm.env.TERM !== "dumb"
  );

  /** Detect if Unicode characters are supported */
  const isUnicodeSupported = Boolean(
    !isWindows
      ? $storm.env.TERM !== "linux"
      : (
          Boolean($storm.env.WT_SESSION) ||
          Boolean($storm.env.TERMINUS_SUBLIME) ||
          $storm.env.ConEmuTask === "{cmd::Cmder}" ||
          $storm.env.TERM_PROGRAM === "Terminus-Sublime" ||
          $storm.env.TERM_PROGRAM === "vscode" ||
          $storm.env.TERM === "xterm-256color" ||
          $storm.env.TERM === "alacritty" ||
          $storm.env.TERM === "rxvt-unicode" ||
          $storm.env.TERM === "rxvt-unicode-256color" ||
          $storm.env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
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
    !$storm.env.NO_COLOR &&
    (hasFlag("color") ||
        hasFlag("colors") ||
        hasFlag("color=true") ||
        hasFlag("color=always") ||
        $storm.env.FORCE_COLOR) ||
        ((hasTTY || isWindows) && $storm.env.TERM !== "dumb")
  );

  const supportsColor = {
    stdout: getColorSupportLevel(process.stdout, { isTTY: tty.isatty(1) }),
    stderr: getColorSupportLevel(process.stderr, { isTTY: tty.isatty(2) }),
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
      : "$storm.env.APP_VERSION"
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
      data: String($storm.env.DATA_DIR)
        ? join(String($storm.env.DATA_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Application Support", "${titleCase(organization)}", "${titleCase(name)}"),
      config: String($storm.env.CONFIG_DIR)
        ? join(String($storm.env.CONFIG_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Preferences", "${titleCase(organization)}", "${titleCase(name)}"),
      cache: String($storm.env.CACHE_DIR)
        ? join(String($storm.env.CACHE_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Caches", "${titleCase(organization)}", "${titleCase(name)}"),
      log: String($storm.env.LOG_DIR)
        ? join(String($storm.env.LOG_DIR), "${titleCase(name)}")
        : join(homedir, "Library", "Logs", "${titleCase(organization)}", "${titleCase(name)}"),
      temp: String($storm.env.TEMP_DIR)
        ? join(String($storm.env.TEMP_DIR), "${titleCase(name)}")
        : join(tmpdir, "${titleCase(organization)}", "${titleCase(name)}")
    }
      : isWindows
    ? {
      data: String($storm.env.DATA_DIR)
        ? join(String($storm.env.DATA_DIR), "${titleCase(name)}")
        : join($storm.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Data"),
      config: String($storm.env.CONFIG_DIR)
        ? join($storm.env.CONFIG_DIR!, "${titleCase(name)}")
        : join($storm.env.APPDATA || join(homedir, "AppData", "Roaming"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Config"),
      cache: String($storm.env.CACHE_DIR)
        ? join(String($storm.env.CACHE_DIR), "${titleCase(name)}")
        : join($storm.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "Cache", "${titleCase(organization)}", "${titleCase(
          name
        )}"),
      log: String($storm.env.LOG_DIR)
        ? join(String($storm.env.LOG_DIR), "${titleCase(name)}")
        : join($storm.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "${titleCase(organization)}", "${titleCase(
          name
        )}", "Log"),
      temp: String($storm.env.TEMP_DIR)
        ? join(String($storm.env.TEMP_DIR), "${titleCase(name)}")
        : join(tmpdir, "${titleCase(organization)}", "${titleCase(name)}")
    }
      :
    {
      data: String($storm.env.DATA_DIR)
        ? join(String($storm.env.DATA_DIR), "${kebabCase(name)}")
        : join(
            $storm.env.XDG_DATA_HOME || join(homedir, ".local", "share"),
            "${kebabCase(organization)}",
            "${kebabCase(name)}"
          ),
      config: String($storm.env.CONFIG_DIR)
        ? join(String($storm.env.CONFIG_DIR), "${kebabCase(name)}")
        : join(
            $storm.env.XDG_CONFIG_HOME || join(homedir, ".config"),
            "${kebabCase(organization)}",
            "${kebabCase(name)}"
          ),
      cache: String($storm.env.CACHE_DIR)
        ? join(String($storm.env.CACHE_DIR), "${kebabCase(name)}")
        : join($storm.env.XDG_CACHE_HOME || join(homedir, ".cache"), "${kebabCase(organization)}", "${kebabCase(
          name
        )}"),
      log: String($storm.env.LOG_DIR)
        ? join(String($storm.env.LOG_DIR), "${kebabCase(name)}")
        : join($storm.env.XDG_STATE_HOME || join(homedir, ".local", "state"), "${kebabCase(organization)}", "${kebabCase(
          name
        )}"),
      temp: String($storm.env.TEMP_DIR)
        ? join(String($storm.env.TEMP_DIR), "${kebabCase(name)}")
        : ($storm.env.DEVENV_RUNTIME || $storm.env.XDG_RUNTIME_DIR
            ? join(($storm.env.DEVENV_RUNTIME || $storm.env.XDG_RUNTIME_DIR)!, "${kebabCase(organization)}", "${kebabCase(
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
    defaultLocale: $storm.env.DEFAULT_LOCALE!,
    defaultTimezone: $storm.env.DEFAULT_TIMEZONE!,
    platform: "${context.options.platform}" as "node" | "neutral" | "browser",
    paths
  };
}

`;
}
