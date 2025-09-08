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
import { Plugin } from "@storm-stack/core/base/plugin";
import {
  isType,
  ReflectionClass,
  ReflectionKind,
  stringifyType
} from "@storm-stack/core/deepkit/type";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
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
import { isSetString } from "@stryke/type-checks/is-set-string";
import {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import defu from "defu";
import BabelPlugin from "./babel/plugin";
import { loadEnv } from "./helpers/load";
import {
  getConfigDefaultTypeDefinition,
  getConfigReflectionsPath,
  getConfigTypeReflectionsPath,
  readConfigReflection,
  readConfigTypeReflection,
  writeConfigReflection,
  writeConfigTypeReflection
} from "./helpers/persistence";
import { reflectConfigParams, reflectConfigSecrets } from "./helpers/reflect";
import { ConfigModule } from "./templates/config";
import {
  ConfigPluginContext,
  ConfigPluginOptions,
  ConfigPluginReflectionRecord,
  ResolvedConfigPluginOptions
} from "./types/plugin";

/**
 * Storm Stack - Config plugin.
 */
export default class ConfigPlugin<
  TContext extends ConfigPluginContext = ConfigPluginContext,
  TOptions extends ConfigPluginOptions = ConfigPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.packageDeps = {};
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "init:reflections": this.initReflections.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "docs:api-reference": this.docsApiReference.bind(this),
      "vite:config": this.viteConfig.bind(this)
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
  protected async initOptions(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Config plugin options for the Storm Stack project.`
    );

    context.options.babel.plugins ??= [];
    context.options.babel.plugins.push(BabelPlugin);

    context.reflections.config ??= {
      types: {
        params: {}
      },
      params: {},
      injected: {}
    } as ConfigPluginReflectionRecord["config"];

    context.options.plugins.config = defu(
      context.options.plugins.config,
      this.options,
      {
        types: {},
        prefix: [],
        inject: context.options.projectType === "application"
      }
    );

    let typeDefinition = {
      types: `${getConfigDefaultTypeDefinition(context).file}#${
        getConfigDefaultTypeDefinition(context).name
      }`
    } as Pick<ConfigPluginOptions, "types" | "secrets">;
    if (!context.options.plugins.config.types) {
      this.log(
        LogLevelLabel.WARN,
        "No environment variable type definitions were provided in the `config.types` configuration."
      );
    } else {
      typeDefinition = isObject(context.options.plugins.config.types)
        ? {
            types: context.options.plugins.config.types
          }
        : {
            types: `${String(context.options.plugins.config.types)}#Config`,
            secrets: `${String(context.options.plugins.config.types)}#Secrets`
          };
    }

    if (
      isSetString(typeDefinition.types) ||
      isSetString((typeDefinition.types as TypeDefinition)?.file)
    ) {
      context.options.plugins.config.types ??=
        {} as ResolvedConfigPluginOptions["types"];
      context.options.plugins.config.types = parseTypeDefinition(
        typeDefinition.types as TypeDefinitionParameter
      ) as ResolvedConfigPluginOptions["types"];
    } else if (!isType(typeDefinition.types)) {
      this.log(
        LogLevelLabel.WARN,
        "The `config.types` configuration parameter was not provided. Please ensure this is expected."
      );
    }

    if (typeDefinition.secrets) {
      context.options.plugins.config.secrets ??=
        {} as ResolvedConfigPluginOptions["secrets"];
      context.options.plugins.config.secrets = parseTypeDefinition(
        typeDefinition.secrets
      ) as TypeDefinition;
      if (!context.options.plugins.config.secrets?.file) {
        throw new Error(
          "Invalid type definition for secrets found in `config.types.secrets` of the provided configuration."
        );
      }
    }

    context.options.plugins.config.prefix = toArray(
      context.options.plugins.config.prefix ?? ([] as string[])
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

    context.options.plugins.config.prefix =
      context.options.plugins.config.prefix.reduce((ret, prefix) => {
        if (!ret.includes(prefix.replace(/_$/g, ""))) {
          ret.push(prefix.replace(/_$/g, ""));
        }
        return ret;
      }, [] as string[]);

    context.options.plugins.config.inject ??=
      context.options.projectType === "application";
    context.options.plugins.config.parsed = await loadEnv(
      context,
      context.options.plugins.config
    );
  }

  protected async initReflections(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the reflection data for the Storm Stack project.`
    );

    if (
      context.options.command !== "prepare" &&
      context.persistedMeta?.checksum === context.meta.checksum &&
      existsSync(getConfigTypeReflectionsPath(context, "params"))
    ) {
      this.log(
        LogLevelLabel.TRACE,
        `Skipping reflection initialization as the meta checksum has not changed.`
      );

      context.reflections.config.types.params = await readConfigTypeReflection(
        context,
        "params"
      );

      if (existsSync(getConfigReflectionsPath(context, "params"))) {
        context.reflections.config.params = await readConfigReflection(
          context,
          "params"
        );
      }

      if (existsSync(getConfigTypeReflectionsPath(context, "secrets"))) {
        context.reflections.config.types.secrets =
          await readConfigTypeReflection(context, "secrets");
      }

      if (existsSync(getConfigReflectionsPath(context, "secrets"))) {
        context.reflections.config.secrets = await readConfigReflection(
          context,
          "secrets"
        );
      }
    } else {
      context.reflections.config.types.params = isType(
        context.options.plugins.config.types
      )
        ? ReflectionClass.from(context.options.plugins.config.types)
        : await reflectConfigParams(
            context,
            (context.options.plugins.config.types as TypeDefinition)?.file
              ? joinPaths(
                  context.options.projectRoot,
                  (context.options.plugins.config.types as TypeDefinition)?.file
                )
              : undefined,
            (context.options.plugins.config.types as TypeDefinition).name
          );
      if (!context.reflections.config.types.params) {
        throw new Error(
          "Failed to find the configuration reflection in the context."
        );
      }

      if (
        context.options.plugins.config.secrets &&
        existsSync(
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.config.secrets.file
          )
        )
      ) {
        context.reflections.config.types.secrets = await reflectConfigSecrets(
          context,
          joinPaths(
            context.options.projectRoot,
            context.options.plugins.config.secrets.file
          ),
          context.options.plugins.config.secrets.name
        );
      }

      this.log(
        LogLevelLabel.TRACE,
        `Resolved ${
          context.reflections.config.types.params.getProperties().length ?? 0
        } configuration parameters and ${
          context.reflections.config.types.secrets?.getProperties().length ?? 0
        } secret config definitions`
      );

      const configWithAlias = context.reflections.config.types.params
        .getProperties()
        .filter(prop => prop.getAlias().length > 0);

      Object.entries(
        await loadEnv(context, context.options.plugins.config)
      ).forEach(([key, value]) => {
        const unprefixedKey = context.options.plugins.config.prefix.reduce(
          (ret, prefix) => {
            if (key.replace(/_$/g, "").startsWith(prefix)) {
              return key.replace(/_$/g, "").slice(prefix.length);
            }
            return ret;
          },
          key
        );

        const aliasKey = configWithAlias.find(prop =>
          prop?.getAlias().reverse().includes(unprefixedKey)
        );
        if (
          context.reflections.config.types.params?.hasProperty(unprefixedKey) ||
          aliasKey
        ) {
          context.reflections.config.types.params
            .getProperty(unprefixedKey)
            .setDefaultValue(value);
        }
      });

      await writeConfigTypeReflection(
        context,
        context.reflections.config.types.params,
        "params"
      );

      context.reflections.config.params = new ReflectionClass(
        {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormConfig",
          description: `An object containing the configuration parameters used by the ${
            context.options.name
              ? `${context.options.name} application`
              : "application"
          }.`,
          types: []
        },
        context.reflections.config.types.params
      );

      await writeConfigReflection(
        context,
        context.reflections.config.params,
        "params"
      );

      if (context.reflections.config.types.secrets) {
        await writeConfigTypeReflection(
          context,
          context.reflections.config.types.secrets,
          "secrets"
        );

        context.reflections.config.secrets = new ReflectionClass(
          {
            kind: ReflectionKind.objectLiteral,
            typeName: "StormSecrets",
            description: `An object containing the secret configuration parameters used by the ${
              context.options.name
                ? `${context.options.name} application`
                : "application"
            }.`,
            types: []
          },
          context.reflections.config.types.secrets
        );
        await writeConfigReflection(
          context,
          context.reflections.config.secrets,
          "secrets"
        );
      }
    }
  }

  /**
   * Prepares the runtime environment for the Storm Stack Config plugin.
   *
   * @param context - The build context.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Configuration runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "config",
      joinPaths(context.runtimePath, "config.ts"),
      await ConfigModule(context)
    );
  }

  /**
   * Generates Config documentation for the Storm Stack project artifacts.
   *
   * @param context - The build context.
   */
  protected async docsApiReference(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      "Writing Config documentation for the Storm Stack project artifacts."
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

    const reflection = await readConfigTypeReflection(context, "params");
    const configDocFile = joinPaths(outputPath, "config.md");

    this.log(
      LogLevelLabel.TRACE,
      `Documenting environment variables configuration in "${configDocFile}"`
    );

    await writeFile(
      this.log,
      configDocFile,
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

  protected viteConfig(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      "Writing Vite configuration for the Storm Stack project artifacts."
    );

    return {
      envPrefix: context.options.plugins.config.prefix
    };
  }
}
