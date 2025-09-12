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
import { existsSync } from "@stryke/fs/exists";
import { createDirectory } from "@stryke/fs/helpers";
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
  getEnvDefaultTypeDefinition,
  getEnvReflectionsPath,
  getEnvTypeReflectionsPath,
  readEnvReflection,
  readEnvTypeReflection,
  readSecretsReflection,
  writeEnvReflection,
  writeEnvTypeReflection
} from "./helpers/persistence";
import { reflectEnv, reflectSecrets } from "./helpers/reflect";
import { EnvModule } from "./templates/env";
import {
  EnvPluginContext,
  EnvPluginOptions,
  EnvPluginReflectionRecord,
  ResolvedEnvPluginOptions
} from "./types/plugin";

/**
 * Storm Stack - Environment Configuration plugin.
 */
export default class EnvPlugin<
  TContext extends EnvPluginContext = EnvPluginContext,
  TOptions extends EnvPluginOptions = EnvPluginOptions
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
      `Initializing the Environment Configuration plugin options for the Storm Stack project.`
    );

    context.options.babel.plugins ??= [];
    context.options.babel.plugins.push(BabelPlugin);

    context.reflections.env ??= {
      types: {
        env: {}
      },
      env: {},
      injected: {}
    } as EnvPluginReflectionRecord["env"];

    context.options.plugins.env = defu(
      context.options.plugins.env,
      this.options,
      {
        types: {},
        prefix: [],
        inject: context.options.projectType === "application"
      }
    );

    let typeDefinition = {
      types: `${getEnvDefaultTypeDefinition(context).file}#${
        getEnvDefaultTypeDefinition(context).name
      }`
    } as Pick<EnvPluginOptions, "types" | "secrets">;
    if (!context.options.plugins.env.types) {
      this.log(
        LogLevelLabel.WARN,
        "No environment variable type definitions were provided in the `env.types` configuration."
      );
    } else {
      typeDefinition = isObject(context.options.plugins.env.types)
        ? {
            types: context.options.plugins.env.types
          }
        : {
            types: `${String(context.options.plugins.env.types)}#Env`,
            secrets: `${String(context.options.plugins.env.types)}#Secrets`
          };
    }

    if (
      isSetString(typeDefinition.types) ||
      isSetString((typeDefinition.types as TypeDefinition)?.file)
    ) {
      context.options.plugins.env.types ??=
        {} as ResolvedEnvPluginOptions["types"];
      context.options.plugins.env.types = parseTypeDefinition(
        typeDefinition.types as TypeDefinitionParameter
      ) as ResolvedEnvPluginOptions["types"];
    } else if (!isType(typeDefinition.types)) {
      this.log(
        LogLevelLabel.WARN,
        "The `env.types` configuration parameter was not provided. Please ensure this is expected."
      );
    }

    if (
      isSetString(typeDefinition.secrets) ||
      isSetString((typeDefinition.secrets as TypeDefinition)?.file)
    ) {
      context.options.plugins.env.secrets ??=
        {} as ResolvedEnvPluginOptions["secrets"];
      context.options.plugins.env.secrets = parseTypeDefinition(
        typeDefinition.secrets as TypeDefinitionParameter
      ) as ResolvedEnvPluginOptions["secrets"];
    }

    context.options.plugins.env.prefix = toArray(
      context.options.plugins.env.prefix ?? ([] as string[])
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

    context.options.plugins.env.prefix =
      context.options.plugins.env.prefix.reduce((ret, prefix) => {
        if (!ret.includes(prefix.replace(/_$/g, ""))) {
          ret.push(prefix.replace(/_$/g, ""));
        }
        return ret;
      }, [] as string[]);

    context.options.plugins.env.inject ??=
      context.options.projectType === "application";
    context.options.plugins.env.parsed = await loadEnv(
      context,
      context.options.plugins.env
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
      existsSync(getEnvTypeReflectionsPath(context, "env"))
    ) {
      this.log(
        LogLevelLabel.TRACE,
        `Skipping reflection initialization as the meta checksum has not changed.`
      );

      context.reflections.env.types.env = await readEnvTypeReflection(
        context,
        "env"
      );

      if (existsSync(getEnvReflectionsPath(context, "env"))) {
        context.reflections.env.env = await readEnvReflection(context);
      }

      context.reflections.env.types.secrets = await readEnvTypeReflection(
        context,
        "secrets"
      );

      if (existsSync(getEnvReflectionsPath(context, "secrets"))) {
        context.reflections.env.secrets = await readSecretsReflection(context);
      }
    } else {
      context.reflections.env.types.env = isType(
        context.options.plugins.env.types
      )
        ? ReflectionClass.from(context.options.plugins.env.types)
        : await reflectEnv(
            context,
            (context.options.plugins.env.types as TypeDefinition)?.file
              ? joinPaths(
                  context.options.projectRoot,
                  (context.options.plugins.env.types as TypeDefinition)?.file
                )
              : undefined,
            (context.options.plugins.env.types as TypeDefinition)?.name
          );
      if (!context.reflections.env.types.env) {
        throw new Error(
          "Failed to find the configuration reflection in the context."
        );
      }

      context.reflections.env.types.secrets = isType(
        context.options.plugins.env.secrets
      )
        ? ReflectionClass.from(context.options.plugins.env.secrets)
        : await reflectSecrets(
            context,
            (context.options.plugins.env.secrets as TypeDefinition)?.file
              ? joinPaths(
                  context.options.projectRoot,
                  (context.options.plugins.env.secrets as TypeDefinition)?.file
                )
              : undefined,
            (context.options.plugins.env.secrets as TypeDefinition)?.name
          );
      if (!context.reflections.env.types.secrets) {
        throw new Error(
          "Failed to find the secrets configuration reflection in the context."
        );
      }

      this.log(
        LogLevelLabel.TRACE,
        `Resolved ${
          context.reflections.env.types.env.getProperties().length ?? 0
        } environment configuration parameters and ${
          context.reflections.env.types.secrets?.getProperties().length ?? 0
        } secret configuration parameters`
      );

      const envWithAlias = context.reflections.env.types.env
        .getProperties()
        .filter(prop => prop.getAlias().length > 0);

      Object.entries(
        await loadEnv(context, context.options.plugins.env)
      ).forEach(([key, value]) => {
        const unprefixedKey = context.options.plugins.env.prefix.reduce(
          (ret, prefix) => {
            if (key.replace(/_$/g, "").startsWith(prefix)) {
              return key.replace(/_$/g, "").slice(prefix.length);
            }
            return ret;
          },
          key
        );

        const aliasKey = envWithAlias.find(prop =>
          prop?.getAlias().reverse().includes(unprefixedKey)
        );
        if (
          context.reflections.env.types.env?.hasProperty(unprefixedKey) ||
          aliasKey
        ) {
          context.reflections.env.types.env
            .getProperty(unprefixedKey)
            .setDefaultValue(value);
        }
      });

      await writeEnvTypeReflection(
        context,
        context.reflections.env.types.env,
        "env"
      );

      context.reflections.env.env = new ReflectionClass(
        {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormEnv",
          description: `An object containing the environment configuration parameters used by the ${
            context.options.name
              ? `${context.options.name} application`
              : "application"
          }.`,
          types: []
        },
        context.reflections.env.types.env
      );

      await writeEnvReflection(context, context.reflections.env.env, "env");

      if (context.reflections.env.types.secrets) {
        await writeEnvTypeReflection(
          context,
          context.reflections.env.types.secrets,
          "secrets"
        );

        context.reflections.env.secrets = new ReflectionClass(
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
          context.reflections.env.types.secrets
        );
        await writeEnvReflection(
          context,
          context.reflections.env.secrets,
          "secrets"
        );
      }
    }
  }

  /**
   * Prepares the runtime environment for the Storm Stack Environment plugin.
   *
   * @param context - The build context.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Environment runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "env",
      joinPaths(context.runtimePath, "env.ts"),
      await EnvModule(context, this.getOptions(context).environmentConfig)
    );
  }

  /**
   * Generates Environment documentation for the Storm Stack project artifacts.
   *
   * @param context - The build context.
   */
  protected async docsApiReference(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      "Writing Environment documentation for the Storm Stack project artifacts."
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

    const reflection = await readEnvTypeReflection(context, "env");
    const envDocFile = joinPaths(outputPath, "env.md");

    this.log(
      LogLevelLabel.TRACE,
      `Documenting environment variables configuration in "${envDocFile}"`
    );

    await writeFile(
      this.log,
      envDocFile,
      `<!-- Generated by Storm Stack -->

# Environment variables configuration

Below is a list of environment variables used by the [${
        context.packageJson.name
      }](https://www.npmjs.com/package/${
        context.packageJson.name
      }) package. These values can be updated in the \`.env\` file in the root of the project.

## Environment Configuration

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
      "Writing Vite environment variables configuration for the Storm Stack project artifacts."
    );

    return {
      envPrefix: context.options.plugins.env.prefix
    };
  }
}
