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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { isDirectory } from "@stryke/fs/is-file";
import { isPackageExists } from "@stryke/fs/package-fns";
import { readFile } from "@stryke/fs/read-file";
import { parseVersion } from "@stryke/fs/semver-fns";
import { findFileName } from "@stryke/path/file-path-fns";
import { getParentPath } from "@stryke/path/get-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { isError } from "@stryke/type-checks/is-error";
import type { ESLint as FlatESLint } from "eslint";
import type { LegacyESLint } from "eslint/use-at-your-own-risk";
import path from "node:path";
import { writeFile } from "../../../lib/utilities/write-file";
import { LogFn } from "../../../types/config";
import type { Context } from "../../../types/context";
import { installPackages } from "../../init/install/utilities";
import type { LintResult } from "./format-result";
import { formatResults } from "./format-result";
import { writeDefaultEslintConfig } from "./write-default-config";

interface Config {
  plugins: string[];
  rules: { [key: string]: Array<number | string> };
}

// 0 is off, 1 is warn, 2 is error. See https://eslint.org/docs/user-guide/configuring/rules#configuring-rules
const VALID_SEVERITY = ["off", "warn", "error"] as const;
type Severity = (typeof VALID_SEVERITY)[number];

function isValidSeverity(severity: string): severity is Severity {
  return VALID_SEVERITY.includes(severity as Severity);
}

interface ConfigAvailable {
  exists: boolean;
  emptyEslint?: boolean;
  emptyPkgJsonConfig?: boolean;
  firstTimeSetup?: true;
}

export interface EventLintCheckCompleted {
  durationInSeconds: number;
  eslintVersion: string | null;
  lintedFilesCount?: number;
  lintFix?: boolean;
  buildLint?: boolean;
  eslintPluginErrorsCount?: number;
  eslintPluginWarningsCount?: number;
  stormStackRulesEnabled: {
    [ruleName: `storm-stack/${string}`]: "off" | "warn" | "error";
  };
}

/**
 * Create a file with eslint output data
 */
async function writeOutputFile(
  log: LogFn,
  /** The name file that needs to be created */
  outputFile: string,
  /** The data that needs to be inserted into the file */
  outputData: string
): Promise<void> {
  const filePath = path.resolve(process.cwd(), outputFile);

  if (isDirectory(filePath)) {
    log(
      LogLevelLabel.ERROR,
      `Cannot write to output file path, it is a directory: ${filePath}`
    );
  } else {
    try {
      await writeFile(log, filePath, outputData);

      log(LogLevelLabel.INFO, `The output file has been created: ${filePath}`);
    } catch (err) {
      log(
        LogLevelLabel.ERROR,
        `There was a problem writing the output file: ${filePath}`
      );
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

async function hasEslintConfiguration(
  eslintFile: string | null,
  packageJsonConfig: { eslintConfig?: any } | null
): Promise<ConfigAvailable> {
  const configObject = {
    exists: false,
    emptyEslint: false,
    emptyPkgJsonConfig: false
  };

  if (eslintFile) {
    const content = await readFile(eslintFile).then(
      txt => txt.trim().replace(/\n/g, ""),
      () => null
    );

    if (
      content === "" ||
      content === "{}" ||
      content === "---" ||
      content === "module.exports = {}"
    ) {
      configObject.emptyEslint = true;
    } else {
      configObject.exists = true;
    }
  } else if (packageJsonConfig?.eslintConfig) {
    if (Object.keys(packageJsonConfig.eslintConfig).length) {
      configObject.exists = true;
    } else {
      configObject.emptyPkgJsonConfig = true;
    }
  }
  return configObject;
}

const lint = async (
  log: LogFn,
  context: Context,
  eslintConfigPath: string | null,
  {
    lintDuringBuild = false,
    eslintOptions = null,
    reportErrorsOnly = false,
    maxWarnings = -1,
    formatter = null,
    outputFile = null
  }: {
    lintDuringBuild: boolean;
    eslintOptions: any;
    reportErrorsOnly: boolean;
    maxWarnings: number;
    formatter: string | null;
    outputFile: string | null;
  }
): Promise<
  | string
  | null
  | {
      output: string | null;
      isError: boolean;
      eventInfo: EventLintCheckCompleted;
    }
> => {
  try {
    // Load ESLint after we're sure it exists:
    await installPackages(context, [
      { name: "eslint", dev: true },
      { name: "eslint-config-storm-stack", dev: true }
    ]);

    const isInstalled = isPackageExists("eslint", {
      paths: [context.options.workspaceRoot, context.options.projectRoot]
    });
    if (!isInstalled) {
      log(
        LogLevelLabel.ERROR,
        `ESLint must be installed${
          lintDuringBuild ? " in order to run during builds:" : ":"
        } npm install --save-dev eslint`
      );

      return null;
    }

    const module = await context.resolver.import<typeof import("eslint")>(
      context.resolver.esmResolve("eslint")
    );

    // If V9 config was found, use flat config, or else use legacy.
    const useFlatConfig = eslintConfigPath
      ? // eslintConfigPath is absolute path
        findFileName(eslintConfigPath).startsWith("eslint.config.")
      : false;

    let ESLint!: typeof FlatESLint | typeof LegacyESLint;
    // loadESLint is >= 8.57.0
    // PR https://github.com/eslint/eslint/pull/18098
    // Release https://github.com/eslint/eslint/releases/tag/v8.57.0
    if ("loadESLint" in module) {
      // By default, configType is `flat`. If `useFlatConfig` is false, the return value is `LegacyESLint`.
      // https://github.com/eslint/eslint/blob/1def4cdfab1f067c5089df8b36242cdf912b0eb6/lib/types/index.d.ts#L1609-L1613
      ESLint = await module.loadESLint({
        useFlatConfig
      });
    }

    const eslintVersion = parseVersion(ESLint?.version);

    if (!eslintVersion || eslintVersion.compare("8.57.0") < 0) {
      return `Error - Your project has an older version of ESLint installed${
        eslintVersion
          ? ` (${eslintVersion.major}.${eslintVersion.minor}.${eslintVersion.patch})`
          : ""
      }. Please upgrade to ESLint version 8.57.0 or above`;
    }

    const options: any = {
      useEslintrc: true,
      baseConfig: {},
      errorOnUnmatchedPattern: false,
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      cache: true,
      ...eslintOptions
    };

    if (eslintVersion?.compare("9.0.0") && useFlatConfig) {
      for (const option of [
        "useEslintrc",
        "extensions",
        "ignorePath",
        "reportUnusedDisableDirectives",
        "resolvePluginsRelativeTo",
        "rulePaths",
        "inlineConfig",
        "maxWarnings"
      ]) {
        if (option in options) {
          delete options[option];
        }
      }
    }

    let eslint = new ESLint(options);

    let stormStackEslintPluginIsEnabled = false;
    const stormStackRulesEnabled = new Map<string, Severity>();

    for (const configFile of [
      eslintConfigPath,
      joinPaths(context.options.projectRoot, "package.json")
    ]) {
      if (!configFile) continue;

      const completeConfig: Config | undefined =
        await eslint.calculateConfigForFile(configFile);
      if (!completeConfig) continue;

      const plugins = completeConfig.plugins;

      const hasStormStackPlugin =
        // in ESLint < 9, `plugins` value is string[]
        Array.isArray(plugins)
          ? plugins.includes("storm-stack")
          : // in ESLint >= 9, `plugins` value is Record<string, unknown>
            "storm-stack" in plugins;

      if (hasStormStackPlugin) {
        stormStackEslintPluginIsEnabled = true;
        for (const [name, [severity]] of Object.entries(completeConfig.rules)) {
          if (!name.startsWith("storm-stack/")) {
            continue;
          }
          if (
            typeof severity === "number" &&
            severity >= 0 &&
            severity < VALID_SEVERITY.length
          ) {
            stormStackRulesEnabled.set(name, VALID_SEVERITY[severity]!);
          } else if (
            typeof severity === "string" &&
            isValidSeverity(severity)
          ) {
            stormStackRulesEnabled.set(name, severity);
          }
        }
        break;
      }
    }

    if (stormStackEslintPluginIsEnabled) {
      eslint = new ESLint(options);
    } else {
      log(
        LogLevelLabel.WARN,
        "The Storm Stack plugin was not detected in your ESLint configuration. See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config"
      );
    }

    const lintStart = process.hrtime();

    let results = await eslint.lintFiles(
      context.tsconfig.fileNames.filter(
        fileName =>
          !fileName.includes(context.artifactsPath) &&
          !fileName.includes("node_modules")
      )
    );

    let selectedFormatter = null as FlatESLint.Formatter | null;
    if (options.fix) {
      await ESLint.outputFixes(results);
    }
    if (reportErrorsOnly) {
      results = ESLint.getErrorResults(results);
    }

    if (formatter) {
      selectedFormatter = await eslint.loadFormatter(formatter);
    }

    const formattedResult = await formatResults(
      context.options.projectRoot,
      results,
      selectedFormatter?.format?.bind(selectedFormatter) as Parameters<
        typeof formatResults
      >[2]
    );
    const lintEnd = process.hrtime(lintStart);
    const totalWarnings = results.reduce(
      (sum: number, file: LintResult) => sum + file.warningCount,
      0
    );

    if (outputFile) {
      await writeOutputFile(log, outputFile, formattedResult.output);
    }

    return {
      output: formattedResult.outputWithMessages,
      isError:
        ESLint.getErrorResults(results)?.length > 0 ||
        (maxWarnings >= 0 && totalWarnings > maxWarnings),
      eventInfo: {
        durationInSeconds: lintEnd[0],
        eslintVersion: eslintVersion.version,
        lintedFilesCount: results.length,
        lintFix: !!options.fix,
        eslintPluginErrorsCount: formattedResult.totalPluginErrorCount,
        eslintPluginWarningsCount: formattedResult.totalPluginWarningCount,
        stormStackRulesEnabled: Object.fromEntries(stormStackRulesEnabled)
      }
    };
  } catch (err) {
    if (lintDuringBuild) {
      log(
        LogLevelLabel.ERROR,
        `ESLint: ${
          isError(err) && err.message
            ? err.message.replace(/\n/g, " ")
            : String(err)
        }`
      );
      return null;
    } else {
      throw err;
    }
  }
};

export async function runEslint(
  context: Context,
  opts: {
    lintDuringBuild?: boolean;
    eslintOptions?: any;
    reportErrorsOnly?: boolean;
    maxWarnings?: number;
    formatter?: string | null;
    outputFile?: string | null;
    type?: "base" | "recommended" | "strict";
  } = {}
): ReturnType<typeof lint> {
  const {
    lintDuringBuild = false,
    eslintOptions = null,
    reportErrorsOnly = false,
    maxWarnings = -1,
    formatter = null,
    outputFile = null,
    type = "recommended"
  } = opts;

  // Find user's .eslintrc file
  // See: https://eslint.org/docs/user-guide/configuring/configuration-files#configuration-file-formats
  const eslintFile =
    getParentPath(
      [
        // eslint v9
        "eslint.config.js",
        "eslint.config.mjs",
        "eslint.config.cjs",
        // TS extensions require to install a separate package `jiti`.
        // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
        "eslint.config.ts",
        "eslint.config.mts",
        "eslint.config.cts",
        // eslint <= v8
        ".eslintrc.js",
        ".eslintrc.cjs",
        ".eslintrc.yaml",
        ".eslintrc.yml",
        ".eslintrc.json",
        ".eslintrc"
      ],
      context.options.projectRoot
    ) ?? null;

  const config = await hasEslintConfiguration(
    eslintFile,
    context.packageJson as { eslintConfig?: any }
  );

  if (config.exists) {
    // Run if ESLint config exists
    return lint(context.log, context, eslintFile, {
      lintDuringBuild,
      eslintOptions,
      reportErrorsOnly,
      maxWarnings,
      formatter,
      outputFile
    });
  }

  // Display warning if no ESLint configuration is present inside
  // config file during "next build", no warning is shown when
  // no eslintrc file is present
  if (lintDuringBuild) {
    if (config.emptyPkgJsonConfig || config.emptyEslint) {
      context.log(
        LogLevelLabel.WARN,
        `No ESLint configuration detected. Run "storm-stack lint" to begin setup`
      );
    }

    return null;
  } else {
    // Check if necessary deps installed, and install any that are missing
    const isEslintInstalled = isPackageExists("eslint", {
      paths: [context.options.workspaceRoot, context.options.projectRoot]
    });
    const isEslintPluginInstalled = isPackageExists(
      "eslint-config-storm-stack",
      {
        paths: [context.options.workspaceRoot, context.options.projectRoot]
      }
    );

    if (!isEslintInstalled || !isEslintPluginInstalled) {
      await installPackages(context, [
        { name: "eslint", dev: true },
        { name: "eslint-config-storm-stack", dev: true }
      ]);
    }

    // Write default ESLint config.
    await writeDefaultEslintConfig(context.log, context, type);
  }

  context.log(
    LogLevelLabel.SUCCESS,
    `ESLint has successfully been configured. Run "storm-stack lint" again to view warnings and errors.`
  );

  return null;
}
