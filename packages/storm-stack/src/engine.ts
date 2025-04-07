/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { Diff, ObjectData } from "@donedeal0/superdiff";
import { getObjectDiff } from "@donedeal0/superdiff";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { install } from "@stryke/fs/install";
import { isPackageExists, isPackageListed } from "@stryke/fs/package-fns";
import { readJsonFile } from "@stryke/fs/read-file";
import { writeFile } from "@stryke/fs/write-file";
import { hash } from "@stryke/hash/hash";
import { hashDirectory } from "@stryke/hash/hash-files";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import { findFilePath, relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { titleCase } from "@stryke/string-format/title-case";
import { isNumber } from "@stryke/type-checks/is-number";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import type { PackageJson } from "@stryke/types/package-json";
import { nanoid } from "@stryke/unique-id/nanoid-client";
import defu from "defu";
import { createHooks } from "hookable";
import { createJiti } from "jiti";
import { format, resolveConfig } from "prettier";
import { Project } from "ts-morph";
import { Compiler } from "./compiler";
import { installPackage, loadConfig } from "./helpers";
import { generateDotenvMarkdown } from "./helpers/dotenv/docgen";
import { loadEnv } from "./helpers/dotenv/load";
import { getDotenvTypeDefinitions } from "./helpers/dotenv/type-definitions";
import { generateDeclarations, generateImports } from "./helpers/dtsgen";
import { runLintCheck } from "./helpers/eslint/run-eslint-check";
import {
  getParsedTypeScriptConfig,
  getTsconfigChanges,
  getTsconfigFilePath
} from "./helpers/tsconfig";
import { createUnimport } from "./helpers/unimport";
import { createLog } from "./helpers/utilities/logger";
import type { Plugin } from "./plugin";
import type { Preset } from "./preset";
import { writeId } from "./runtime";
import { writeError } from "./runtime/error";
import { writeLog } from "./runtime/log";
import { writeRequest } from "./runtime/request";
import { writeResponse } from "./runtime/response";
import type {
  Context,
  EngineHookFunctions,
  EngineHooks,
  LogFn,
  Options,
  PluginConfig,
  ProjectConfig,
  ResolvedDotenvOptions,
  SourceFile
} from "./types";

/**
 * The Storm Stack Engine class
 *
 * @remarks
 * This class is responsible for managing the Storm Stack project lifecycle, including initialization, building, and finalization.
 *
 * @public
 */
export class Engine<TOptions extends Options = Options> {
  #initialized = false;

  /**
   * The engine hooks - these allow the plugins to hook into the engines processing
   */
  #hooks!: EngineHooks<TOptions>;

  /**
   * The plugins provided in the options
   */
  #plugins: Plugin<TOptions>[] = [];

  /**
   * The options provided to Storm Stack
   */
  protected options: Options;

  /**
   * The resolved options provided to Storm Stack
   */
  protected context: Context<TOptions>;

  /**
   * The entry point for the project
   */
  protected entry?: TypeDefinition | TypeDefinition[];

  /**
   * The logger for the plugin
   */
  protected log: LogFn;

  /**
   * The default environment variables to apply
   */
  protected defaultEnv: Record<string, any> = {};

  public constructor(options: TOptions, workspaceConfig: StormWorkspaceConfig) {
    this.options = options;
    this.log = createLog("engine", this.options);

    this.context = this.options as Context<TOptions>;
    this.context.override ??= {};
    this.context.workspaceConfig = workspaceConfig;
    this.context.envPaths = getEnvPaths({
      orgId: "storm-software",
      appId: "storm-stack",
      workspaceRoot: this.context.workspaceConfig?.workspaceRoot
    });
    if (!this.context.envPaths.cache) {
      throw new Error("The cache directory could not be determined.");
    }

    this.context.envPaths.cache = joinPaths(
      this.context.envPaths.cache,
      hash(this.options.projectRoot)
    );
    this.context.unimportPresets = [
      {
        imports: ["StormJSON"],
        from: "@stryke/json/storm-json"
      },
      {
        imports: ["StormError"],
        from: "storm:error"
      },
      {
        imports: ["StormRequest"],
        from: "storm:request"
      },
      {
        imports: ["StormResponse"],
        from: "storm:response"
      },
      {
        imports: ["StormLog"],
        from: "storm:log"
      },
      {
        imports: ["id"],
        from: "storm:id"
      },
      {
        imports: ["getRandom"],
        from: "storm:id"
      }
    ];

    this.context.resolver = createJiti(
      this.context.workspaceConfig.workspaceRoot,
      {
        interopDefault: true,
        fsCache: joinPaths(this.context.envPaths.cache, "jiti"),
        moduleCache: true
      }
    );
  }

  /**
   * Initialize the engine
   */
  public async init(): Promise<Context<TOptions>> {
    this.log(LogLevelLabel.TRACE, "Initializing Storm Stack engine");

    this.#hooks = createHooks<EngineHookFunctions<TOptions>>();

    this.context = defu(
      this.context,
      (await this.loadConfig()) ?? {}
    ) as Context<TOptions>;

    this.context.vars = {};

    const checksum = await hashDirectory(this.context.projectRoot, {
      ignored: ["node_modules", ".git", ".nx", ".cache", ".storm", "tmp"]
    });
    this.context.meta ??= {
      buildId: nanoid(24),
      releaseId: nanoid(24),
      checksum,
      timestamp: Date.now()
    };

    this.context.tsconfig ??= getTsconfigFilePath(this.context);

    this.context.artifactsDir ??= ".storm";
    this.context.runtimeDir = joinPaths(this.context.artifactsDir, "runtime");
    this.context.typesDir = joinPaths(this.context.artifactsDir, "types");

    if (
      existsSync(
        joinPaths(
          this.context.projectRoot,
          this.context.artifactsDir,
          "meta.json"
        )
      )
    ) {
      this.context.persistedMeta = await readJsonFile(
        joinPaths(
          this.context.projectRoot,
          this.context.artifactsDir,
          "meta.json"
        )
      );
    }

    this.context.dts =
      this.options.dts || joinPaths(this.context.typesDir, "env.d.ts");
    if (isSetString(this.context.dts)) {
      this.context.dts = this.context.dts
        .replace(this.context.projectRoot, "")
        .trim();
    }

    this.context.outputPath ??= joinPaths("dist", this.context.projectRoot);

    for (const preset of this.context.presets ?? []) {
      await this.addPreset(preset);
    }

    for (const plugin of this.context.plugins ?? []) {
      await this.addPlugin(plugin);
    }

    if (!this.context.plugins) {
      this.log(
        LogLevelLabel.WARN,
        "No Storm Stack plugins were specified in the options. Please ensure this is correct, as it is generally not recommended."
      );
    } else {
      for (const plugin of this.#plugins) {
        await Promise.resolve(plugin.addHooks(this.#hooks));
      }
    }

    this.log(
      LogLevelLabel.TRACE,
      "Checking the Storm Stack project configuration"
    );

    const projectJsonPath = joinPaths(this.context.projectRoot, "project.json");
    if (existsSync(projectJsonPath)) {
      this.context.projectJson = await readJsonFile(projectJsonPath);
      this.context.name ??= this.context.projectJson?.name;
      this.context.projectType ??= this.context.projectJson?.projectType;
    }

    if (this.context.projectType === "application" && this.context.entry) {
      this.context.errorsFile ??= joinPaths(
        this.context.workspaceConfig.workspaceRoot,
        "errors.json"
      );

      if (isSetString(this.context.entry)) {
        this.context.resolvedEntry = [
          {
            ...this.resolveEntry(this.context, this.context.entry),
            input: parseTypeDefinition(this.context.entry)!
          }
        ];
      } else if (
        Array.isArray(this.context.entry) &&
        this.context.entry.filter(Boolean).length > 0
      ) {
        this.context.resolvedEntry = this.context.entry
          .map(entry => ({
            ...this.resolveEntry(this.context, entry),
            input: parseTypeDefinition(entry)!
          }))
          .filter(Boolean);
      }
    }

    await this.#hooks
      .callHook("init:context", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while checking the Storm Stack project configuration: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while checking the Storm Stack project configuration",
          { cause: error }
        );
      });

    if (!isPackageExists("typescript")) {
      throw new Error(
        `The TypeScript package is not installed. Please install the package using the command: "npm install typescript --save-dev"`
      );
    }

    this.log(
      LogLevelLabel.TRACE,
      `Checking and installing missing project dependencies.`
    );

    await Promise.all(
      [
        installPackage<TOptions>(this.log, this.context, "@stryke/types", true),
        this.context.projectType === "application" &&
          installPackage<TOptions>(
            this.log,
            this.context,
            "@stryke/type-checks"
          ),
        this.context.projectType === "application" &&
          installPackage<TOptions>(this.log, this.context, "@stryke/json")
      ].filter(Boolean)
    );

    await this.#hooks
      .callHook("init:installs", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while installing project dependencies: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while installing project dependencies",
          { cause: error }
        );
      });

    this.log(
      LogLevelLabel.TRACE,
      `Checking the TypeScript configuration file (tsconfig.json): ${this.context.tsconfig}`
    );

    const originalTsconfigJson = await readJsonFile<NonNullable<ObjectData>>(
      this.context.tsconfig
    );

    const json = await getTsconfigChanges(this.context);
    if (
      !json.include?.some(filterPattern =>
        (filterPattern as string[]).includes(
          joinPaths(this.context.artifactsDir, "**/*.ts")
        )
      )
    ) {
      json.include ??= [];
      json.include.push(joinPaths(this.context.artifactsDir, "**/*.ts"));
    }

    const config =
      (await resolveConfig(
        joinPaths(
          this.context.workspaceConfig.workspaceRoot,
          this.context.tsconfig
        )
      )) ?? {};
    await this.writeFile(
      this.context.tsconfig,
      await format(StormJSON.stringify(json), {
        ...config,
        filepath: this.context.tsconfig
      })
    );

    await this.#hooks
      .callHook("init:tsconfig", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while resolving the TypeScript options: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while resolving the TypeScript options",
          { cause: error }
        );
      });

    const result = getObjectDiff(
      originalTsconfigJson,
      await readJsonFile<NonNullable<ObjectData>>(this.context.tsconfig),
      {
        ignoreArrayOrder: true,
        showOnly: {
          statuses: ["added", "deleted", "updated"],
          granularity: "deep"
        }
      }
    );

    const changes = [] as {
      field: string;
      status: "added" | "deleted" | "updated";
      previous: string;
      current: string;
    }[];
    const getChanges = (difference: Diff, property?: string) => {
      if (
        difference.status === "added" ||
        difference.status === "deleted" ||
        difference.status === "updated"
      ) {
        if (difference.diff) {
          for (const diff of difference.diff) {
            getChanges(
              diff,
              property
                ? `${property}.${difference.property}`
                : difference.property
            );
          }
        } else {
          changes.push({
            field: property
              ? `${property}.${difference.property}`
              : difference.property,
            status: difference.status,
            previous:
              difference.status === "added"
                ? "---"
                : StormJSON.stringify(difference.previousValue),
            current:
              difference.status === "deleted"
                ? "---"
                : StormJSON.stringify(difference.currentValue)
          });
        }
      }
    };

    for (const diff of result.diff) {
      getChanges(diff);
    }

    if (changes.length > 0) {
      this.log(
        LogLevelLabel.WARN,
        `Updating the following configuration values in the "tsconfig.json" file:

  ${changes
    .map(
      (
        change,
        i
      ) => `${i + 1}. ${titleCase(change.status)} the ${change.field} field:
   - Previous: ${change.previous}
   - Current: ${change.current}
  `
    )
    .join("\n")}
  `
      );
    }

    this.context.resolvedTsconfig = await getParsedTypeScriptConfig(
      this.context
    );
    if (!this.context.resolvedTsconfig) {
      throw new Error("Failed to parse the TypeScript configuration file.");
    }

    const packageJsonPath = joinPaths(this.context.projectRoot, "package.json");
    if (!existsSync(packageJsonPath)) {
      throw new Error(
        `Cannot find a \`package.json\` configuration file in ${this.context.projectRoot}.`
      );
    }
    this.context.packageJson = await readJsonFile<PackageJson>(packageJsonPath);

    this.context.unimport = createUnimport<TOptions>(this.log, this.context);
    await this.context.unimport.init();

    this.context.project = new Project({
      compilerOptions: this.context.resolvedTsconfig.options,
      tsConfigFilePath: this.context.tsconfig
    });

    const handleTransform = async (
      context: Context<TOptions>,
      sourceFile: SourceFile
    ) => {
      await this.#hooks
        .callHook("build:transform", context, sourceFile)
        .catch((error: Error) => {
          this.log(
            LogLevelLabel.ERROR,
            `An error occured while transforming the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
          );

          throw new Error(
            "An error occured while transforming the Storm Stack project",
            { cause: error }
          );
        });
    };

    this.context.compiler = new Compiler<TOptions>(
      this.context,
      handleTransform
    );

    this.context.resolvedDotenv = await this.resolveDotenvOptions();
    if (isSetString(this.context.resolvedDotenv.docgen)) {
      this.context.resolvedDotenv.docgen = this.context.resolvedDotenv.docgen
        .replace(this.context.projectRoot, "")
        .trim();
    }

    this.log(LogLevelLabel.TRACE, "Storm Stack engine has been initialized");
    this.#initialized = true;

    return this.context;
  }

  /**
   * Clean any previously prepared artifacts
   */
  public async clean() {
    if (!this.#initialized) {
      await this.init();
    }

    this.log(LogLevelLabel.TRACE, "Running Storm Stack - Clean command");

    await Promise.all([
      removeDirectory(
        joinPaths(this.context.projectRoot, this.context.artifactsDir)
      ),
      removeDirectory(
        joinPaths(
          this.context.workspaceConfig.workspaceRoot,
          this.context.outputPath?.replace(
            this.context.workspaceConfig.workspaceRoot,
            ""
          ) || joinPaths("dist", this.context.projectRoot)
        )
      )
    ]);

    await this.#hooks.callHook("clean", this.context).catch((error: Error) => {
      this.log(
        LogLevelLabel.ERROR,
        `An error occured while cleaning the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error(
        "An error occured while cleaning the Storm Stack project",
        { cause: error }
      );
    });

    this.log(LogLevelLabel.TRACE, "Storm Stack - Clean command completed");
  }

  /**
   * Prepare the Storm Stack project prior to building
   *
   * @remarks
   * This method will create the necessary directories, and write the artifacts files to the project.
   *
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async prepare(autoClean = true) {
    if (!this.#initialized) {
      await this.init();
    }

    if (
      existsSync(
        joinPaths(this.context.projectRoot, this.context.artifactsDir)
      ) &&
      autoClean
    ) {
      this.log(
        LogLevelLabel.INFO,
        "Cleaning the previous build artifacts before preparing the project"
      );

      await this.clean();
    }

    this.log(LogLevelLabel.TRACE, "Preparing Storm Stack project");

    if (
      !existsSync(
        joinPaths(this.context.projectRoot, this.context.artifactsDir)
      )
    ) {
      await createDirectory(
        joinPaths(this.context.projectRoot, this.context.artifactsDir)
      );
    }
    if (
      !existsSync(joinPaths(this.context.projectRoot, this.context.runtimeDir))
    ) {
      await createDirectory(
        joinPaths(this.context.projectRoot, this.context.runtimeDir)
      );
    }
    if (
      !existsSync(joinPaths(this.context.projectRoot, this.context.typesDir))
    ) {
      await createDirectory(
        joinPaths(this.context.projectRoot, this.context.typesDir)
      );
    }

    await this.writeFile(
      joinPaths(
        this.context.projectRoot,
        this.context.artifactsDir,
        "meta.json"
      ),
      StormJSON.stringify(this.context.meta)
    );
    this.context.persistedMeta = this.context.meta;

    await this.writeDeclarations();

    await this.#hooks
      .callHook("prepare:types", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while writing type artifacts: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while generating the type artifacts",
          { cause: error }
        );
      });

    if (this.context.projectType === "application") {
      await this.context.unimport.dumpImports();

      const runtimeDir = joinPaths(
        this.context.projectRoot,
        this.context.runtimeDir
      );
      this.log(
        LogLevelLabel.TRACE,
        `Writing to runtime directory "${runtimeDir}"`
      );

      await Promise.all([
        this.writeFile(joinPaths(runtimeDir, "request.ts"), writeRequest()),
        this.writeFile(joinPaths(runtimeDir, "response.ts"), writeResponse()),
        this.writeFile(joinPaths(runtimeDir, "error.ts"), writeError()),
        this.writeFile(joinPaths(runtimeDir, "id.ts"), writeId()),
        this.writeFile(joinPaths(runtimeDir, "log.ts"), writeLog())
      ]);

      await this.#hooks
        .callHook("prepare:runtime", this.context)
        .catch((error: Error) => {
          this.log(
            LogLevelLabel.ERROR,
            `An error occured while generating the runtime artifacts: ${error.message} \n${error.stack ?? ""}`
          );

          throw new Error(
            "An error occured while generating the runtime artifacts",
            { cause: error }
          );
        });

      if (this.context.resolvedEntry && this.context.resolvedEntry.length > 0) {
        this.#hooks
          .callHook("prepare:entry", this.context)
          .catch((error: Error) => {
            this.log(
              LogLevelLabel.ERROR,
              `An error occured while creating entry artifacts: ${error.message} \n${error.stack ?? ""}`
            );

            throw new Error("An error occured while creating entry artifacts", {
              cause: error
            });
          });
      }

      this.#hooks
        .callHook("prepare:deploy", this.context)
        .catch((error: Error) => {
          this.log(
            LogLevelLabel.ERROR,
            `An error occured while creating deployment artifacts: ${error.message} \n${error.stack ?? ""}`
          );

          throw new Error(
            "An error occured while creating deployment artifacts",
            {
              cause: error
            }
          );
        });
    }

    this.#hooks.callHook("prepare:misc", this.context).catch((error: Error) => {
      this.log(
        LogLevelLabel.ERROR,
        `An error occured while creating miscellaneous artifacts: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error(
        "An error occured while creating miscellaneous artifacts",
        {
          cause: error
        }
      );
    });

    await this.writeDotenvDoc();
  }

  /**
   * Build the project
   *
   * @param autoPrepare - Whether to automatically prepare the project if it has not been prepared
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async build(autoPrepare = true, autoClean = true) {
    if (!this.#initialized) {
      await this.init();
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      if (autoPrepare) {
        this.log(
          LogLevelLabel.INFO,
          "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
        );

        await this.prepare(autoClean);
      } else {
        throw new Error(
          "The Storm Stack project has not been prepared. Please run the `prepare` command before trying to build the project."
        );
      }
    }

    this.log(LogLevelLabel.TRACE, "Building Storm Stack project");

    if (!this.context.skipLint) {
      await runLintCheck(this.log, this.context, {
        lintDuringBuild: true,
        eslintOptions: {
          cacheLocation: joinPaths(this.context.envPaths.cache, "eslint")
        }
      });
    }

    await this.#hooks
      .callHook("build:execute", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while building the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while building the Storm Stack project",
          { cause: error }
        );
      });

    if (this.context.vars) {
      this.log(LogLevelLabel.TRACE, "Writing Storm Stack var.json file");

      await this.writeFile(
        joinPaths(
          this.context.projectRoot,
          this.context.artifactsDir,
          "vars.json"
        ),
        StormJSON.stringify(this.context.vars)
      );
    }
  }

  /**
   * Finalization process
   *
   * @remarks
   * This step includes any final processes or clean up required by Storm Stack. It will be run after each Storm Stack command.
   */
  public async finalize() {
    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution started");

    await this.#hooks
      .callHook("finalize", this.context)
      .catch((error: Error) => {
        this.log(
          LogLevelLabel.ERROR,
          `An error occured while finalizing the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while finalizing the Storm Stack project",
          { cause: error }
        );
      });

    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution completed");
  }

  protected resolveEntry(
    options: Context<TOptions>,
    entry: TypeDefinitionParameter
  ): TypeDefinition {
    const parsed = parseTypeDefinition(entry)!;
    let entryFile = parsed.file.replace(options.projectRoot, "");
    while (entryFile.startsWith("/")) {
      entryFile = entryFile.substring(1);
    }

    return {
      file: joinPaths(
        options.projectRoot,
        options.artifactsDir,
        `entry-${hash(entryFile, { maxLength: 8 })}.ts`
      ),
      name: parsed.name
    };
  }

  /**
   * Add a Storm Stack preset to the build process
   *
   * @param preset - The import path of the preset to add
   */
  protected async addPreset(preset: string | PluginConfig) {
    if (
      preset &&
      !this.#plugins.some(p =>
        typeof preset === "string"
          ? p.installPath === preset
          : p.installPath === preset[0]
      )
    ) {
      const pluginConfig: PluginConfig =
        typeof preset === "string" ? [preset, {}] : preset;
      const isInstalled = await isPackageListed(
        pluginConfig[0],
        this.context.projectRoot
      );
      if (!isInstalled && this.context.skipInstalls !== true) {
        this.log(
          LogLevelLabel.WARN,
          `The preset package "${pluginConfig[0]}" is not installed. It will be installed automatically.`
        );

        const result = await install(pluginConfig[0], {
          cwd: this.context.projectRoot
        });
        if (isNumber(result.exitCode) && result.exitCode > 0) {
          this.log(LogLevelLabel.ERROR, result.stderr);
          throw new Error(
            `An error occurred while installing the build preset package "${pluginConfig[0]}" `
          );
        }
      }

      let presetInstance!: Preset<TOptions>;
      try {
        const module = await this.context.resolver.import<{
          default: new (config: any) => Preset<TOptions>;
        }>(this.context.resolver.esmResolve(pluginConfig[0]));
        const PresetConstructor = module.default;

        presetInstance = new PresetConstructor(pluginConfig[1]);
      } catch (error) {
        if (!isInstalled) {
          throw new Error(
            `The preset package "${pluginConfig[0]}" is not installed. Please install the package using the command: "npm install ${pluginConfig[0]} --save-dev"`
          );
        } else {
          throw new Error(
            `An error occurred while importing the build preset package "${pluginConfig[0]}":
${error.message}

Note: Please ensure the preset package's default export is a class that extends \`Plugin\` with a constructor that excepts zero arguments.`
          );
        }
      }

      if (!presetInstance) {
        throw new Error(
          `The preset package "${pluginConfig[0]}" does not export a valid module.`
        );
      }

      if (!presetInstance.name) {
        throw new Error(
          `The module in the build preset package "${pluginConfig[0]}" must export a \`name\` string value.`
        );
      }
      if (!presetInstance.addHooks) {
        throw new Error(
          `The build preset "${presetInstance.name}" must export an \`addHooks\` function.`
        );
      }

      if (presetInstance.dependencies) {
        for (const dependency of presetInstance.dependencies) {
          await this.addPlugin(dependency);
        }
      }

      this.log(
        LogLevelLabel.INFO,
        `Successfully initialized the "${presetInstance.name}" preset`
      );

      this.#plugins.push(presetInstance);
    }
  }

  /**
   * Add a Storm Stack plugin to the build process
   *
   * @param plugin - The import path of the plugin to add
   */
  protected async addPlugin(plugin: string | PluginConfig) {
    if (
      plugin &&
      !this.#plugins.some(p =>
        typeof plugin === "string"
          ? p.installPath === plugin
          : p.installPath === plugin[0]
      )
    ) {
      const pluginConfig: PluginConfig =
        typeof plugin === "string" ? [plugin, {}] : plugin;
      const isInstalled = await isPackageListed(
        pluginConfig[0],
        this.context.projectRoot
      );
      if (!isInstalled && this.context.skipInstalls !== true) {
        this.log(
          LogLevelLabel.WARN,
          `The plugin package "${pluginConfig[0]}" is not installed. It will be installed automatically.`
        );

        const result = await install(pluginConfig[0], {
          cwd: this.context.projectRoot
        });
        if (isNumber(result.exitCode) && result.exitCode > 0) {
          this.log(LogLevelLabel.ERROR, result.stderr);
          throw new Error(
            `An error occurred while installing the build plugin package "${pluginConfig[0]}" `
          );
        }
      }

      let pluginInstance!: Plugin<TOptions>;
      try {
        const module = await this.context.resolver.import<{
          default: new (config: any) => Plugin<TOptions>;
        }>(this.context.resolver.esmResolve(pluginConfig[0]));
        const PluginConstructor = module.default;

        pluginInstance = new PluginConstructor(pluginConfig[1]);
      } catch (error) {
        if (!isInstalled) {
          throw new Error(
            `The plugin package "${pluginConfig[0]}" is not installed. Please install the package using the command: "npm install ${pluginConfig[0]} --save-dev"`
          );
        } else {
          throw new Error(
            `An error occurred while importing the build plugin package "${pluginConfig[0]}":
${error.message}

Note: Please ensure the plugin package's default export is a class that extends \`Plugin\` with a constructor that excepts zero arguments.`
          );
        }
      }

      if (!pluginInstance) {
        throw new Error(
          `The plugin package "${pluginConfig[0]}" does not export a valid module.`
        );
      }

      if (!pluginInstance.name) {
        throw new Error(
          `The module in the build plugin package "${pluginConfig[0]}" must export a \`name\` string value.`
        );
      }
      if (!pluginInstance.addHooks) {
        throw new Error(
          `The build plugin "${pluginInstance.name}" must export an \`addHooks\` function.`
        );
      }

      this.log(
        LogLevelLabel.INFO,
        `Successfully initialized the "${pluginInstance.name}" plugin`
      );

      this.#plugins.push(pluginInstance);
    }
  }

  /**
   * Load the Storm Stack configuration
   *
   * @returns The Storm Stack configuration
   */
  protected async loadConfig(): Promise<ProjectConfig> {
    return loadConfig(
      this.context.projectRoot,
      this.context.mode,
      joinPaths(this.context.envPaths.cache, "jiti")
    );
  }

  /**
   * Resolve the dotenv options
   *
   * @returns The resolved dotenv options
   */
  protected async resolveDotenvOptions(): Promise<ResolvedDotenvOptions> {
    const dotenv = {} as ResolvedDotenvOptions;
    dotenv.types = getDotenvTypeDefinitions(this.log, this.context);
    dotenv.additionalFiles = this.context.dotenv?.additionalFiles ?? [];
    dotenv.docgen =
      this.context.dotenv?.docgen ??
      joinPaths(this.context.projectRoot, "docs", "dotenv.md");
    dotenv.replace = Boolean(this.context.dotenv?.replace);

    const env = defu(
      await loadEnv(
        this.context,
        dotenv,
        this.context.envPaths.cache,
        this.context.envPaths.config,
        this.context.packageJson,
        this.context.workspaceConfig
      ),
      this.defaultEnv,
      {
        APP_NAME:
          this.context.name ||
          this.context.packageJson.name?.replace(
            `/${this.context.workspaceConfig.namespace}`,
            ""
          ),
        APP_VERSION: this.context.packageJson.version,
        BUILD_ID: this.context.meta.buildId,
        BUILD_TIMESTAMP: this.context.meta.timestamp,
        BUILD_CHECKSUM: this.context.meta.checksum,
        RELEASE_ID: this.context.meta.releaseId,
        MODE: this.context.mode,
        ORG: this.context.workspaceConfig.organization,
        ORGANIZATION: this.context.workspaceConfig.organization,
        PLATFORM: this.context.platform,
        STACKTRACE: this.context.mode === "development",
        ENVIRONMENT: this.context.mode,
        DEVELOPMENT: this.context.mode === "development",
        STAGING: this.context.mode === "staging",
        PRODUCTION: this.context.mode === "production",
        DEBUG: this.context.mode === "development"
      }
    );

    dotenv.values = Object.keys(env).reduce((ret, key) => {
      if (key.includes("(") || key.includes(")")) {
        ret[key.replaceAll("(", "").replaceAll(")", "")] = env[key];
      }

      return ret;
    }, env);

    return dotenv;
  }

  /**
   * Write the Typescript declarations
   */
  protected async writeDeclarations() {
    if (isSetString(this.context.dts)) {
      const dtsFile = joinPaths(
        this.context.projectRoot,
        this.context.dts.replace(this.context.projectRoot, "").trim()
      );
      this.log(
        LogLevelLabel.TRACE,
        `Writing a declaration file in "${dtsFile}"`
      );

      let content = "";
      if (this.context.resolvedDotenv.types?.variables?.properties) {
        content = generateDeclarations(
          this.context.resolvedDotenv.types.variables.properties
        );
      }

      const dtsFilePath = findFilePath(dtsFile);
      if (dtsFilePath && !existsSync(dtsFilePath)) {
        await createDirectory(dtsFilePath);
      }

      return Promise.all(
        [
          content && this.writeFile(dtsFile, content),
          this.writeFile(
            joinPaths(
              this.context.projectRoot,
              this.context.typesDir,
              "imports.d.ts"
            ),
            generateImports(
              relativePath(
                joinPaths(this.context.projectRoot, this.context.typesDir),
                joinPaths(this.context.projectRoot, this.context.runtimeDir)
              )
            )
          )
        ].filter(Boolean)
      );
    }

    this.log(
      LogLevelLabel.INFO,
      "The `dts` option was set to `false`. Skipping declaration generation."
    );

    // eslint-disable-next-line no-useless-return
    return;
  }

  /**
   * Write the dotenv documentation markdown file
   */
  private async writeDotenvDoc() {
    if (isSetString(this.context.resolvedDotenv.docgen)) {
      const docgenFile = joinPaths(
        this.context.projectRoot,
        this.context.resolvedDotenv.docgen
          .replace(this.context.projectRoot, "")
          .trim()
      );
      this.log(
        LogLevelLabel.TRACE,
        `Documenting environment variables configuration in "${docgenFile}"`
      );

      if (this.context.resolvedDotenv.types?.variables?.properties) {
        const docgenFilePath = findFilePath(docgenFile);
        if (docgenFilePath && !existsSync(docgenFilePath)) {
          await createDirectory(docgenFilePath);
        }

        return this.writeFile(
          docgenFile,
          generateDotenvMarkdown(
            this.context.packageJson,
            this.context.resolvedDotenv.types.variables.properties
          )
        );
      }
    }

    this.log(
      LogLevelLabel.INFO,
      "The `dotenv.docgen` option was set to `false`. Skipping dotenv documentation."
    );
  }

  /**
   * Writes a file to the file system
   */
  private async writeFile(filepath: string, content: string) {
    const config = (await resolveConfig(filepath)) ?? {};
    await writeFile(
      filepath,
      await format(content, {
        ...config,
        filepath
      })
    );
  }
}
