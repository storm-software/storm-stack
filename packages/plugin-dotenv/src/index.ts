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

import { ReflectionClass, ReflectionKind, stringifyType } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import { SourceFile } from "@storm-stack/core/types";
import type { EngineHooks } from "@storm-stack/core/types/build";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { toArray } from "@stryke/convert/to-array";
import { ENV_PREFIXES } from "@stryke/env/types";
import { createDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { constantCase } from "@stryke/string-format/constant-case";
import { isObject } from "@stryke/type-checks/is-object";
import { TypeDefinition } from "@stryke/types/configuration";
import BabelPlugin from "./babel/plugin";
import { loadEnv } from "./helpers/load";
import {
  getDotenvDefaultTypeDefinition,
  getDotenvReflectionsPath,
  readConfigReflection,
  readDotenvReflection,
  writeDotenvReflection
} from "./helpers/persistence";
import { reflectDotenvConfig, reflectDotenvSecrets } from "./helpers/reflect";
import { ConfigModule } from "./templates/config";
import {
  DotenvPluginConfig,
  DotenvPluginContext,
  DotenvTypeDefinitionParameters,
  ReflectedDotenvTypeDefinitions,
  ResolvedDotenvOptions
} from "./types";

/**
 * Storm Stack - Dotenv plugin.
 */
export default class DotenvPlugin<
  TConfig extends DotenvPluginConfig = DotenvPluginConfig
> extends Plugin<TConfig> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.packageDeps = {};
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "init:reflections": this.initReflections.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "prepare:types": this.prepareTypes.bind(this),
      "docs:api-reference": this.docsApiReference.bind(this)
    });
  }

  /**
   * Initializes the plugin's options.
   *
   * @remarks
   * This method is called during the initialization phase of the plugin. It can be used to set default options or modify existing ones.
   *
   * @param context - The context of the current build.
   */
  protected async initOptions(context: DotenvPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Dotenv plugin options for the Storm Stack project.`
    );

    context.options.babel.plugins ??= [];
    context.options.babel.plugins.push(BabelPlugin);

    context.options.plugins.dotenv ??= {
      types: {}
    } as ResolvedDotenvOptions;

    let params = {
      config: `${getDotenvDefaultTypeDefinition(context).file}#${
        getDotenvDefaultTypeDefinition(context).name
      }`
    } as DotenvTypeDefinitionParameters;
    if (!context.options.plugins.dotenv.types) {
      this.log(
        LogLevelLabel.WARN,
        "No environment variable type definitions were provided in the `dotenv.types` configuration."
      );
    } else {
      params = isObject(context.options.plugins.dotenv.types)
        ? context.options.plugins.dotenv.types
        : {
            config: `${String(context.options.plugins.dotenv.types)}#Config`,
            secrets: `${String(context.options.plugins.dotenv.types)}#Secrets`
          };
    }

    if (params.config) {
      context.options.plugins.dotenv.types ??=
        {} as ReflectedDotenvTypeDefinitions;
      context.options.plugins.dotenv.types.config = parseTypeDefinition(
        params.config
      ) as TypeDefinition;
    } else {
      this.log(
        LogLevelLabel.WARN,
        "The `dotenv.types.config` configuration parameter was not provided. Please ensure this is expected."
      );
    }

    if (params.secrets) {
      context.options.plugins.dotenv.types ??=
        {} as ReflectedDotenvTypeDefinitions;
      context.options.plugins.dotenv.types.secrets = parseTypeDefinition(
        params.secrets
      ) as TypeDefinition;
      if (!context.options.plugins.dotenv.types.secrets?.file) {
        throw new Error(
          "Invalid type definition for secrets found in `dotenv.types.secrets` of the provided configuration."
        );
      }
    }

    context.options.plugins.dotenv.prefix = toArray(
      context.options.plugins.dotenv.prefix ?? ([] as string[])
    ).reduce(
      (ret, prefix) => {
        const formattedPrefix = constantCase(prefix);
        if (!ret.includes(formattedPrefix)) {
          ret.push(formattedPrefix);
        }

        return ret;
      },
      [...ENV_PREFIXES] as string[]
    );

    context.options.plugins.dotenv.prefix =
      context.options.plugins.dotenv.prefix.reduce((ret, prefix) => {
        if (!ret.includes(prefix.replace(/_$/g, ""))) {
          ret.push(prefix.replace(/_$/g, ""));
        }
        return ret;
      }, [] as string[]);

    context.options.plugins.dotenv.inject ??=
      context.options.projectType === "application";
    context.options.plugins.dotenv.values = await loadEnv(
      context,
      context.options.plugins.dotenv
    );
  }

  protected async initReflections(context: DotenvPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the reflection data for the Storm Stack project.`
    );

    if (
      context.persistedMeta?.checksum === context.meta.checksum &&
      existsSync(getDotenvReflectionsPath(context, "config"))
    ) {
      this.log(
        LogLevelLabel.TRACE,
        `Skipping reflection initialization as the meta checksum has not changed.`
      );

      context.reflections.configDotenv = await readDotenvReflection(
        context,
        "config"
      );
      context.reflections.config = await readConfigReflection(
        context,
        "config"
      );
    } else {
      if (
        context.options.plugins.dotenv.types.config?.file &&
        existsSync(
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.dotenv.types.config.file
          )
        )
      ) {
        context.reflections.configDotenv = await reflectDotenvConfig(
          context,
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.dotenv.types.config.file
          ),
          context.options.plugins.dotenv.types.config.name
        );
      } else {
        context.reflections.configDotenv = await reflectDotenvConfig(context);
      }

      if (
        context.options.plugins.dotenv.types.secrets &&
        existsSync(
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.dotenv.types.secrets.file
          )
        )
      ) {
        context.reflections.secretsDotenv = await reflectDotenvSecrets(
          context,
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.dotenv.types.secrets.file
          ),
          context.options.plugins.dotenv.types.secrets.name
        );
      }

      if (!context.reflections.configDotenv) {
        throw new Error(
          "Failed to find the configuration reflection in the context."
        );
      }

      this.log(
        LogLevelLabel.TRACE,
        `Resolved ${
          context.reflections.configDotenv.getProperties().length ?? 0
        } configuration parameters and ${
          context.reflections.secretsDotenv?.getProperties().length ?? 0
        } secret dotenv definitions`
      );

      await writeDotenvReflection(
        context,
        context.reflections.configDotenv,
        "config"
      );

      if (context.reflections.secretsDotenv) {
        await writeDotenvReflection(
          context,
          context.reflections.secretsDotenv,
          "secrets"
        );
      }

      context.reflections.config = ReflectionClass.from({
        kind: ReflectionKind.objectLiteral,
        description: `An object containing the configuration parameters used by the ${
          context.options.name
            ? `${context.options.name} application`
            : "application"
        }.`,
        types: []
      });
    }
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: DotenvPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the configuration runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "config",
      joinPaths(context.runtimePath, "config.ts"),
      await ConfigModule(context)
    );
  }

  /**
   * Returns the type definition for the plugin.
   *
   * @returns The type definition for the plugin.
   */
  protected async prepareTypes(
    context: DotenvPluginContext,
    sourceFile: SourceFile
  ) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the type definitions for the Storm Stack DotEnv plugin.`
    );

    const dotenvReflection = await readDotenvReflection(context, "config");
    if (!dotenvReflection) {
      throw new Error("Could not read dotenv reflection for config.");
    }

    sourceFile.code.append(`

type StormDotenv = Omit<StormBaseConfig, ${dotenvReflection
      .getProperties()
      .filter(item => item.isHidden() || item.isIgnored() || item.isReadonly())
      .map(prop => `"${prop.getNameAsString()}"`)
      .join(" | ")}> & Readonly<Pick<StormBaseConfig, ${dotenvReflection
      .getProperties()
      .filter(
        item => !item.isHidden() && !item.isIgnored() && item.isReadonly()
      )
      .map(prop => `"${prop.getNameAsString()}"`)
      .join(" | ")}>>;

declare const $storm: StormContext<StormDotenv>;
`);
  }

  /**
   * Generates Dotenv documentation for the Storm Stack project artifacts.
   *
   * @param context - The build context.
   */
  protected async docsApiReference(context: DotenvPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      "Writing Dotenv documentation for the Storm Stack project artifacts."
    );

    // Clean and recreate the output directories
    const outputPath = joinPaths(
      context.options.projectRoot,
      "docs",
      "generated"
    );

    if (!existsSync(outputPath)) {
      await createDirectory(outputPath);
    }

    const reflection = await readDotenvReflection(context, "config");
    const dotenvDocFile = joinPaths(outputPath, "dotenv.md");

    this.log(
      LogLevelLabel.TRACE,
      `Documenting environment variables configuration in "${dotenvDocFile}"`
    );

    await writeFile(
      this.log,
      dotenvDocFile,
      `<!-- Generated by Storm Stack -->

# Environment variables configuration

Below is a list of environment variables used by the [${
        context.packageJson.name
      }](https://www.npmjs.com/package/${
        context.packageJson.name
      }) package. These values can be updated in the \`.env\` file in the root of the project.

## Configuration Parameters

The below list of environment variables are used as configuration parameters to drive the processing of the application. The data contained in these variables are **not** considered sensitive or confidential. Any values provided in these variables will be available in plain text to the public.

| Name | Description | Type | Default Value | Required |
| ---- | ----------- | ---- | ------------- | :------: |
${reflection
  .getProperties()
  .filter(property => property.getNameAsString() !== "__STORM_INJECTED__")
  .sort((a, b) => a.getNameAsString().localeCompare(b.getNameAsString()))
  .map(reflectionProperty => {
    return `| ${reflectionProperty.getNameAsString().trim()} | ${(
      reflectionProperty
        .getDescription()
        ?.replaceAll("\r", "")
        ?.replaceAll("\n", "") ?? ""
    ).trim()} | ${stringifyType(reflectionProperty.getType())
      .trim()
      .replaceAll(" | ", ", or ")} | ${
      reflectionProperty.hasDefault()
        ? String(reflectionProperty.getDefaultValue())?.includes('"')
          ? reflectionProperty.getDefaultValue()
          : `\`${reflectionProperty.getDefaultValue()}\``
        : ""
    } | ${reflectionProperty.isValueRequired() ? "" : "✔"} |`;
  })
  .join("\n")}
`
    );
  }
}
