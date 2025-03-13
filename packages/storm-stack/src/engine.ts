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
import type { StormConfig } from "@storm-software/config/types";

import { getEnvPaths } from "@stryke/env/get-env-paths";
import { createDirectory, removeDirectory } from "@stryke/fs/files/helpers";
import { readJsonFile } from "@stryke/fs/files/read-file";
import { writeFile } from "@stryke/fs/files/write-file";
import { install } from "@stryke/fs/package/install";
import {
  isPackageExists,
  isPackageListed
} from "@stryke/fs/package/package-fns";
import { hash } from "@stryke/hash/hash";
import { hashDirectory } from "@stryke/hash/hash-files";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/utilities/exists";
import {
  findFilePath,
  relativePath
} from "@stryke/path/utilities/file-path-fns";
import { joinPaths } from "@stryke/path/utilities/join-paths";
import { titleCase } from "@stryke/string-format/title-case";
import { parseTypeDefinition } from "@stryke/types/helpers/parse-type-definition";
import { isNumber } from "@stryke/types/type-checks/is-number";
import { isSetString } from "@stryke/types/type-checks/is-set-string";
import type {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/utility-types/configuration";
import type { PackageJson } from "@stryke/types/utility-types/package-json";
import { nanoid } from "@stryke/unique-id/nanoid-client";
import defu from "defu";
import { createHooks } from "hookable";
import type { Jiti } from "jiti";
import { createJiti } from "jiti";
import { format, resolveConfig } from "prettier";
import type { Project, ts } from "ts-morph";
import { Compiler } from "./compiler";
import { installPackage } from "./helpers";
import { generateDotenvMarkdown } from "./helpers/dotenv/docgen";
import { loadEnv } from "./helpers/dotenv/load";
import { getDotenvTypeDefinitions } from "./helpers/dotenv/type-definitions";
import { generateDeclarations, generateImports } from "./helpers/dtsgen";
import { loadConfig } from "./helpers/load-config";
import {
  getParsedTypeScriptConfig,
  getTsconfigChanges,
  getTsconfigFilePath
} from "./helpers/tsconfig";
import { createUnimport } from "./helpers/unimport";
import { createLog } from "./helpers/utilities/logger";
import type { Plugin } from "./plugin";
import { writeId } from "./runtime";
import { writeError } from "./runtime/error";
import { writeLog } from "./runtime/log";
import { writeRequest } from "./runtime/request";
import { writeResponse } from "./runtime/response";
import type {
  EngineHookFunctions,
  EngineHooks,
  InferResolvedOptions,
  LogFn,
  Options,
  PluginConfig,
  ProjectConfig,
  ResolvedDotenvOptions,
  SourceFile,
  UnimportContext
} from "./types";

/**
 * The Storm Stack Engine class
 *
 * @remarks
 * This class is responsible for managing the Storm Stack project lifecycle, including initialization, building, and finalization.
 *
 * @public
 */
export class Engine<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> {
  #initialized = false;

  /**
   * The compiler used to transform the source files
   */
  #compiler!: Compiler;

  /**
   * The compiler used to transform the source files
   */
  public get compiler(): Compiler {
    if (!this.#initialized) {
      throw new Error(
        "Cannot access the compiler before the driver is initialized"
      );
    }

    return this.#compiler;
  }

  /**
   * The engine hooks - these allow the plugins to hook into the engines processing
   */
  #hooks!: EngineHooks<TOptions, TResolvedOptions>;

  /**
   * The plugins provided in the options
   */
  #plugins: Plugin<TOptions, TResolvedOptions>[] = [];

  /**
   * The options provided to Storm Stack
   */
  protected options: Options;

  /**
   * The resolved options provided to Storm Stack
   */
  protected resolvedOptions: TResolvedOptions;

  /**
   * The entry point for the project
   */
  protected entry?: TypeDefinition | TypeDefinition[];

  /**
   * The logger for the plugin
   */
  protected log: LogFn;

  /**
   * The Jiti module resolver
   */
  protected resolver: Jiti;

  /**
   * The Storm Project configuration object
   */
  protected config!: ProjectConfig;

  /**
   * The project's package.json file content
   */
  protected packageJson!: PackageJson;

  /**
   * The project's project.json file content
   */
  protected projectJson!: Record<string, any>;

  /**
   * The resolved `unimport` context to be used by the compiler
   */
  protected unimport!: UnimportContext;

  /**
   * The resolved tsconfig options
   */
  protected tsconfig!: ts.ParsedCommandLine;

  /**
   * The default environment variables to apply
   */
  protected defaultEnv: Record<string, any> = {};

  public constructor(options: TOptions, workspaceConfig: StormConfig) {
    this.options = options;
    this.log = createLog("engine", this.options);

    this.resolvedOptions = this.options as TResolvedOptions;
    this.resolvedOptions.override ??= {};
    this.resolvedOptions.workspaceConfig = workspaceConfig;
    this.resolvedOptions.envPaths = getEnvPaths({
      orgId: "storm-software",
      appId: "storm-stack",
      workspaceRoot: this.resolvedOptions.workspaceConfig?.workspaceRoot
    });
    if (!this.resolvedOptions.envPaths.cache) {
      throw new Error("The cache directory could not be determined.");
    }

    this.resolvedOptions.envPaths.cache = joinPaths(
      this.resolvedOptions.envPaths.cache,
      hash(this.options.projectRoot)
    );
    this.resolvedOptions.presets = [
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

    this.resolver = createJiti(
      this.resolvedOptions.workspaceConfig.workspaceRoot,
      {
        interopDefault: true,
        fsCache: joinPaths(this.resolvedOptions.envPaths.temp, "jiti"),
        moduleCache: true
      }
    );
  }

  /**
   * Initialize the engine
   */
  public async init() {
    this.log(LogLevelLabel.TRACE, "Initializing Storm Stack engine");

    this.#hooks =
      createHooks<EngineHookFunctions<TOptions, TResolvedOptions>>();

    this.resolvedOptions = defu(
      this.resolvedOptions,
      (await this.loadConfig()) ?? {}
    ) as TResolvedOptions;

    const checksum = await hashDirectory(this.resolvedOptions.projectRoot, {
      ignored: ["node_modules", ".git", ".nx", ".cache", ".storm", "tmp"]
    });
    this.resolvedOptions.meta ??= {
      buildId: nanoid(24),
      releaseId: nanoid(24),
      checksum,
      timestamp: Date.now()
    };

    this.resolvedOptions.tsconfig ??= getTsconfigFilePath(this.resolvedOptions);

    this.resolvedOptions.artifactsDir ??= ".storm";
    this.resolvedOptions.runtimeDir = joinPaths(
      this.resolvedOptions.artifactsDir,
      "runtime"
    );
    this.resolvedOptions.typesDir = joinPaths(
      this.resolvedOptions.artifactsDir,
      "types"
    );

    if (
      existsSync(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir,
          "meta.json"
        )
      )
    ) {
      this.resolvedOptions.persistedMeta = await readJsonFile(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir,
          "meta.json"
        )
      );
    }

    this.resolvedOptions.dts =
      this.options.dts || joinPaths(this.resolvedOptions.typesDir, "env.d.ts");
    if (isSetString(this.resolvedOptions.dts)) {
      this.resolvedOptions.dts = this.resolvedOptions.dts
        .replace(this.resolvedOptions.projectRoot, "")
        .trim();
    }

    this.resolvedOptions.outputPath ??= joinPaths(
      "dist",
      this.resolvedOptions.projectRoot
    );

    if (!this.resolvedOptions.plugins) {
      this.log(
        LogLevelLabel.WARN,
        "No Storm Stack plugins were specified in the options. Please ensure this is correct, as it is generally not recommended."
      );
    } else {
      for (const plugin of this.resolvedOptions.plugins) {
        await this.addPlugin(plugin);
      }

      for (const plugin of this.#plugins) {
        await Promise.resolve(plugin.addHooks(this.#hooks));
      }
    }

    this.log(
      LogLevelLabel.TRACE,
      "Checking the Storm Stack project configuration"
    );

    const projectJsonPath = joinPaths(
      this.resolvedOptions.projectRoot,
      "project.json"
    );
    if (existsSync(projectJsonPath)) {
      this.projectJson = await readJsonFile(projectJsonPath);
      this.resolvedOptions.name ??= this.projectJson?.name;
      this.resolvedOptions.projectType ??= this.projectJson?.projectType;
    }

    if (
      this.resolvedOptions.projectType === "application" &&
      this.resolvedOptions.entry
    ) {
      if (isSetString(this.resolvedOptions.entry)) {
        this.resolvedOptions.resolvedEntry = [
          {
            ...this.resolveEntry(
              this.resolvedOptions,
              this.resolvedOptions.entry
            ),
            input: parseTypeDefinition(this.resolvedOptions.entry)!
          }
        ];
      } else if (
        Array.isArray(this.resolvedOptions.entry) &&
        this.resolvedOptions.entry.filter(Boolean).length > 0
      ) {
        this.resolvedOptions.resolvedEntry = this.resolvedOptions.entry
          .map(entry => ({
            ...this.resolveEntry(this.resolvedOptions, entry),
            input: parseTypeDefinition(entry)!
          }))
          .filter(Boolean);
      }
    }

    await this.#hooks
      .callHook("init:options", this.resolvedOptions)
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
        installPackage<TOptions>(
          this.log,
          this.resolvedOptions,
          "@stryke/types",
          true
        ),
        this.resolvedOptions.projectType === "application" &&
          installPackage<TOptions>(
            this.log,
            this.resolvedOptions,
            "@stryke/json"
          )
      ].filter(Boolean)
    );

    await this.#hooks
      .callHook("init:installs", this.resolvedOptions)
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
      `Checking the TypeScript configuration file (tsconfig.json): ${this.resolvedOptions.tsconfig}`
    );

    const originalTsconfigJson = await readJsonFile<NonNullable<ObjectData>>(
      this.resolvedOptions.tsconfig
    );

    const json = await getTsconfigChanges(this.resolvedOptions);
    if (
      !json.include?.some(filterPattern =>
        (filterPattern as string[]).includes(
          joinPaths(this.resolvedOptions.artifactsDir, "**/*.ts")
        )
      )
    ) {
      json.include ??= [];
      json.include.push(
        joinPaths(this.resolvedOptions.artifactsDir, "**/*.ts")
      );
    }

    const config =
      (await resolveConfig(
        joinPaths(
          this.resolvedOptions.workspaceConfig.workspaceRoot,
          this.resolvedOptions.tsconfig
        )
      )) ?? {};
    await this.writeFile(
      this.resolvedOptions.tsconfig,
      await format(StormJSON.stringify(json), {
        ...config,
        filepath: this.resolvedOptions.tsconfig
      })
    );

    await this.#hooks
      .callHook("init:tsconfig", this.resolvedOptions)
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
      await readJsonFile<NonNullable<ObjectData>>(
        this.resolvedOptions.tsconfig
      ),
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

    this.tsconfig = await getParsedTypeScriptConfig(this.resolvedOptions);
    if (!this.tsconfig) {
      throw new Error("Failed to parse the TypeScript configuration file.");
    }

    const packageJsonPath = joinPaths(
      this.resolvedOptions.projectRoot,
      "package.json"
    );
    if (!existsSync(packageJsonPath)) {
      throw new Error(
        `Cannot find a \`package.json\` configuration file in ${this.resolvedOptions.projectRoot}.`
      );
    }
    this.packageJson = await readJsonFile<PackageJson>(packageJsonPath);

    this.unimport = createUnimport<TOptions, TResolvedOptions>(
      this.log,
      this.resolvedOptions
    );
    await this.unimport.init();

    this.#compiler = new Compiler(
      this.resolvedOptions,
      joinPaths(
        findFilePath(this.resolvedOptions.envPaths.cache),
        hash(this.tsconfig.options)
      ),
      this.tsconfig,
      this.transformSourceFile.bind(this)
    );

    this.resolvedOptions.resolvedDotenv = await this.resolveDotenvOptions();
    if (isSetString(this.resolvedOptions.resolvedDotenv.docgen)) {
      this.resolvedOptions.resolvedDotenv.docgen =
        this.resolvedOptions.resolvedDotenv.docgen
          .replace(this.resolvedOptions.projectRoot, "")
          .trim();
    }

    this.log(LogLevelLabel.TRACE, "Storm Stack engine has been initialized");
    this.#initialized = true;
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
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir
        )
      ),
      removeDirectory(
        joinPaths(
          this.resolvedOptions.workspaceConfig.workspaceRoot,
          this.resolvedOptions.outputPath?.replace(
            this.resolvedOptions.workspaceConfig.workspaceRoot,
            ""
          ) || joinPaths("dist", this.resolvedOptions.projectRoot)
        )
      )
    ]);

    await this.#hooks
      .callHook("clean", this.resolvedOptions)
      .catch((error: Error) => {
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
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir
        )
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
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir
        )
      )
    ) {
      await createDirectory(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.artifactsDir
        )
      );
    }
    if (
      !existsSync(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.runtimeDir
        )
      )
    ) {
      await createDirectory(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.runtimeDir
        )
      );
    }
    if (
      !existsSync(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.typesDir
        )
      )
    ) {
      await createDirectory(
        joinPaths(
          this.resolvedOptions.projectRoot,
          this.resolvedOptions.typesDir
        )
      );
    }

    await this.writeFile(
      joinPaths(
        this.resolvedOptions.projectRoot,
        this.resolvedOptions.artifactsDir,
        "meta.json"
      ),
      StormJSON.stringify(this.resolvedOptions.meta)
    );
    this.resolvedOptions.persistedMeta = this.resolvedOptions.meta;

    await this.writeDeclarations();

    await this.#hooks
      .callHook("prepare:types", this.resolvedOptions)
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

    if (this.resolvedOptions.projectType === "application") {
      await this.unimport.dumpImports();

      const runtimeDir = joinPaths(
        this.resolvedOptions.projectRoot,
        this.resolvedOptions.runtimeDir
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
        .callHook("prepare:runtime", this.resolvedOptions)
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

      if (
        this.resolvedOptions.resolvedEntry &&
        this.resolvedOptions.resolvedEntry.length > 0
      ) {
        this.#hooks
          .callHook("prepare:entry", this.resolvedOptions)
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
        .callHook("prepare:deploy", this.resolvedOptions)
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

    this.#hooks
      .callHook("prepare:misc", this.resolvedOptions)
      .catch((error: Error) => {
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

    if (
      this.resolvedOptions.persistedMeta?.checksum !==
      this.resolvedOptions.meta.checksum
    ) {
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

    await this.#hooks
      .callHook("build", this.resolvedOptions)
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
      .callHook("finalize", this.resolvedOptions)
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
    options: TResolvedOptions,
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
        this.resolvedOptions.projectRoot
      );
      if (!isInstalled && this.resolvedOptions.skipInstalls !== true) {
        this.log(
          LogLevelLabel.WARN,
          `The plugin package "${pluginConfig[0]}" is not installed. It will be installed automatically.`
        );

        const result = await install(pluginConfig[0], {
          cwd: this.resolvedOptions.projectRoot
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
        const module = await this.resolver.import<{
          default: new (config: any) => Plugin<TOptions>;
        }>(this.resolver.esmResolve(pluginConfig[0]));
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

      if (pluginInstance.dependencies) {
        for (const dependency of pluginInstance.dependencies) {
          await this.addPlugin(dependency);
        }
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
      this.resolvedOptions.projectRoot,
      this.resolvedOptions.mode,
      joinPaths(this.resolvedOptions.envPaths.cache, "jiti")
    );
  }

  /**
   * Resolve the dotenv options
   *
   * @returns The resolved dotenv options
   */
  protected async resolveDotenvOptions(): Promise<ResolvedDotenvOptions> {
    const dotenv = {} as ResolvedDotenvOptions;
    dotenv.types = getDotenvTypeDefinitions(
      this.log,
      this.resolvedOptions,
      this.#compiler.project
    );
    dotenv.additionalFiles = this.resolvedOptions.dotenv?.additionalFiles ?? [];
    dotenv.docgen =
      this.resolvedOptions.dotenv?.docgen ??
      joinPaths(this.resolvedOptions.projectRoot, "docs", "dotenv.md");
    dotenv.replace = Boolean(this.resolvedOptions.dotenv?.replace);

    const env = defu(
      await loadEnv(
        this.resolvedOptions,
        dotenv,
        this.resolvedOptions.envPaths.cache,
        this.resolvedOptions.envPaths.config,
        this.packageJson,
        this.resolvedOptions.workspaceConfig
      ),
      this.defaultEnv,
      {
        APP_NAME:
          this.resolvedOptions.name ||
          this.packageJson.name?.replace(
            `/${this.resolvedOptions.workspaceConfig.namespace}`,
            ""
          ),
        APP_VERSION: this.packageJson.version,
        BUILD_ID: this.resolvedOptions.meta.buildId,
        BUILD_TIMESTAMP: this.resolvedOptions.meta.timestamp,
        BUILD_CHECKSUM: this.resolvedOptions.meta.checksum,
        RELEASE_ID: this.resolvedOptions.meta.releaseId,
        MODE: this.resolvedOptions.mode,
        ORG: this.resolvedOptions.workspaceConfig.organization,
        ORGANIZATION: this.resolvedOptions.workspaceConfig.organization,
        PLATFORM: this.resolvedOptions.platform,
        STACKTRACE: this.resolvedOptions.mode === "development",
        ENVIRONMENT: this.resolvedOptions.mode,
        DEVELOPMENT: this.resolvedOptions.mode === "development",
        STAGING: this.resolvedOptions.mode === "staging",
        PRODUCTION: this.resolvedOptions.mode === "production"
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
   * Prepare the source file prior to compilation
   *
   * @param source - The source file to prepare
   * @param _project - The project instance
   * @returns The prepared source file
   */
  protected async transformSourceFile(
    source: SourceFile,
    _project: Project
  ): Promise<SourceFile> {
    if (
      this.unimport &&
      !source.id.replaceAll("\\", "/").includes(this.resolvedOptions.runtimeDir)
    ) {
      source = await this.unimport.injectImports(source);
    }

    return source;
  }

  /**
   * Write the Typescript declarations
   */
  protected async writeDeclarations() {
    if (isSetString(this.resolvedOptions.dts)) {
      const dtsFile = joinPaths(
        this.resolvedOptions.projectRoot,
        this.resolvedOptions.dts
          .replace(this.resolvedOptions.projectRoot, "")
          .trim()
      );
      this.log(
        LogLevelLabel.TRACE,
        `Writing a declaration file in "${dtsFile}"`
      );

      let content = "";
      if (this.resolvedOptions.resolvedDotenv.types?.variables?.properties) {
        content = generateDeclarations(
          this.resolvedOptions.resolvedDotenv.types.variables.properties
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
              this.resolvedOptions.projectRoot,
              this.resolvedOptions.typesDir,
              "imports.d.ts"
            ),
            generateImports(
              relativePath(
                joinPaths(
                  this.resolvedOptions.projectRoot,
                  this.resolvedOptions.typesDir
                ),
                joinPaths(
                  this.resolvedOptions.projectRoot,
                  this.resolvedOptions.runtimeDir
                )
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
    if (isSetString(this.resolvedOptions.resolvedDotenv.docgen)) {
      const docgenFile = joinPaths(
        this.resolvedOptions.projectRoot,
        this.resolvedOptions.resolvedDotenv.docgen
          .replace(this.resolvedOptions.projectRoot, "")
          .trim()
      );
      this.log(
        LogLevelLabel.TRACE,
        `Documenting environment variables configuration in "${docgenFile}"`
      );

      if (this.resolvedOptions.resolvedDotenv.types?.variables?.properties) {
        const docgenFilePath = findFilePath(docgenFile);
        if (docgenFilePath && !existsSync(docgenFilePath)) {
          await createDirectory(docgenFilePath);
        }

        return this.writeFile(
          docgenFile,
          generateDotenvMarkdown(
            this.packageJson,
            this.resolvedOptions.resolvedDotenv.types.variables.properties
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
