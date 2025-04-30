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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/helpers";
import { Preset } from "@storm-stack/core/preset";
import type {
  Context,
  EngineHooks,
  Options,
  ResolvedEntryTypeDefinition
} from "@storm-stack/core/types";
import { StormStackNodeFeatures } from "@storm-stack/plugin-node/types/config";
import { listFiles } from "@stryke/fs/list-files";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { isDirectory } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import defu from "defu";
import { reflectCommands } from "./helpers/reflect-command";
import { writeStorage } from "./runtime/storage";
import type { StormStackCLIPresetConfig } from "./types/config";
import type { CommandReflection } from "./types/reflection";

export default class StormStackCLIPreset<
  TOptions extends Options = Options
> extends Preset<TOptions> {
  #config: StormStackCLIPresetConfig;

  #commandEntries: ResolvedEntryTypeDefinition[] = [];

  public constructor(config: Partial<StormStackCLIPresetConfig> = {}) {
    super("cli", "@storm-stack/preset-cli");

    this.#config = {
      features: [],
      ...config
    };
    this.dependencies = [
      [
        "@storm-stack/plugin-node",
        {
          features: [...this.#config.features, StormStackNodeFeatures.ENV_PATHS]
        }
      ]
    ];
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initContext.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this)
    });
  }

  protected async initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    if (
      context.projectType === "application" &&
      isSetString(context.entry) &&
      isDirectory(context.entry)
    ) {
      const files = (await listFiles(joinPaths(context.entry, "**/*.ts"))).map(
        file =>
          file.replace(
            `${joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.entry as string
            )}/`,
            ""
          )
      );
      if (files.length === 0) {
        this.log(
          LogLevelLabel.WARN,
          `No commands could be found in ${context.entry}. Please ensure this is correct.`
        );
      } else {
        this.log(
          LogLevelLabel.TRACE,
          `The following commands were found in the entry directory: ${files.join(
            ", "
          )}`
        );

        const bin = kebabCase(this.#config.bin || context.name || "cli");
        const resolvedEntry = {
          file: joinPaths(
            context.projectRoot,
            context.artifactsDir,
            `${bin}.ts`
          ),
          input: { file: joinPaths(context.entry) },
          output: bin
        };

        let packageJson = context.packageJson;
        if (!packageJson) {
          packageJson = await readJsonFile(
            joinPaths(context.projectRoot, "package.json")
          );
        }

        await this.writeFile(
          joinPaths(context.projectRoot, "package.json"),
          StormJSON.stringify(
            defu(
              {
                bin: {
                  [bin]: `${joinPaths("dist", bin)}.js`
                }
              },
              packageJson
            )
          )
        );

        if (
          context.resolvedEntry.length === 0 ||
          !context.resolvedEntry[0]?.file
        ) {
          context.resolvedEntry.push(resolvedEntry);
        } else {
          context.resolvedEntry[0] = resolvedEntry;
        }

        this.#commandEntries = files.reduce((ret, file) => {
          let entryFile = joinPaths(
            context.projectRoot,
            context.artifactsDir,
            "commands",
            file.replace(context.entry as string, "")
          );
          if (
            findFileName(entryFile) !== "index.ts" &&
            findFileName(entryFile) !== "index.tsx"
          ) {
            entryFile = joinPaths(
              entryFile.replace(findFileExtension(entryFile), ""),
              "index.ts"
            );
          }

          if (ret.some(entry => entry.file === entryFile)) {
            this.log(
              LogLevelLabel.WARN,
              `Duplicate entry file found: ${entryFile}. Please ensure this is correct.`
            );
          } else {
            ret.push({
              file: entryFile,
              input: { file: joinPaths(context.entry as string, file) }
            });
          }

          return ret;
        }, [] as ResolvedEntryTypeDefinition[]);
      }
    }
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(context, "@stryke/cli"),
        context.projectType === "application" &&
          this.install(context, "@storm-stack/log-storage"),
        context.projectType === "application" &&
          this.install(context, "consola")
      ].filter(Boolean)
    );
  }

  protected async prepareRuntime(context: Context<TOptions>) {
    const runtimeDir = joinPaths(context.projectRoot, context.runtimeDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime files in "${runtimeDir}"`
    );

    await Promise.all([
      this.writeFile(joinPaths(runtimeDir, "storage.ts"), writeStorage())
    ]);
  }

  protected async prepareEntry(context: Context<TOptions>) {
    try {
      const commands = await reflectCommands(
        this.log,
        context,
        this.#commandEntries
      );

      await Promise.all(
        Object.values(commands).map(async command =>
          this.prepareCommandDefinition(context, command)
        )
      );

      const name = context.name ?? this.#config.bin;
      const displayName = titleCase(name);

      await Promise.all(
        context.resolvedEntry.map(async entry =>
          this.writeFile(
            entry.file,
            `#!/usr/bin/env node
${getFileHeader()}

import "storm:init";

import { renderUrls, renderLicense } from "@stryke/cli/meta";
import { resolveCommand } from "@stryke/cli/parse";
import { runCommand } from "@stryke/cli/run";
import {
  alignText,
  alignTextLeft,
  alignTextCenter
} from "@stryke/cli/align-text";
import { registerShutdown } from "@stryke/cli/shutdown";
import { renderUsage } from "@stryke/cli/usage";
import { tryGetWorkspaceConfig } from "@stryke/cli/usage";
import consola from "consola";
import { isStormError } from "storm:error";
import { colors } from "consola/utils";

const shutdown = await registerShutdown();

try {
  const rawArgs = process.argv.slice(2);
  const command = await resolveCommand(
    {
      meta: {
        name: "${name}",
        displayName: "${displayName}",
        version: $storm.env.APP_VERSION,
        description: "${context.packageJson.description || `The ${displayName} command-line interface application`}",
        homepage: ${
          context.workspaceConfig?.homepage
            ? `"${context.workspaceConfig.homepage}"`
            : context.packageJson.homepage
              ? `"${context.packageJson.homepage}"`
              : "undefined"
        },
        license: ${
          context.workspaceConfig?.license
            ? `"${context.workspaceConfig.license}"`
            : context.packageJson.license
              ? `"${context.packageJson.license}"`
              : "undefined"
        },
        licensing: ${
          context.workspaceConfig?.licensing
            ? `"${context.workspaceConfig.licensing}"`
            : "undefined"
        },
        docs: ${
          context.workspaceConfig?.docs
            ? `"${context.workspaceConfig.docs}"`
            : "undefined"
        },
        repository: ${
          context.workspaceConfig?.repository
            ? `"${context.workspaceConfig.repository}"`
            : isSetString(context.packageJson.repository)
              ? `"${context.packageJson.repository}"`
              : isSetString(context.packageJson.repository?.url)
                ? `"${context.packageJson.repository?.url}"`
                : "undefined"
        },
        contact: ${
          context.workspaceConfig?.contact
            ? `"${context.workspaceConfig.contact}"`
            : "undefined"
        }
      },
      subCommands: {
        ${Object.keys(commands)
          .map(
            command =>
              `${command}: () => import("./${joinPaths("commands", command)}").then(m => m.default)`
          )
          .join(",\n")}
      }
    },
    rawArgs
  );

  const meta =
    typeof command.meta === "function"
      ? await command.meta()
      : await command.meta;
  if (meta) {
    const renderedUrls = renderUrls(meta);
    const renderedDescription = \`\${colors.dim(meta.description)}\`;

    const titleText = \`\${colors.bold(\`\${meta.displayName} v\${meta.version}\`)}\`;
    const renderedTitle = alignText(
      titleText,
      lineLength => alignTextCenter(lineLength, Math.max(...[titleText, renderedDescription, renderedUrls].join("\\n").split("\\n").map(line => line.length)))
    );

    consola.box(\`\${renderedTitle}\\n\\n\${renderedDescription}\\n\\n\${renderedUrls}\`, {
      padding: 1
    });
    consola.log(\`\\n\\n\${renderLicense(meta)}\\n\\n\`);
  }

  if (
    rawArgs.includes("--help") ||
    rawArgs.includes("-h") ||
    rawArgs.includes("-?")
  ) {
    consola.log(\`\${await renderUsage(command)}\\n\\n\`);
    consola.log(\`\${await renderLicense(meta)}\\n\\n\`);
  } else if (
    rawArgs.length === 1 &&
    (rawArgs[0] === "--version" || rawArgs[0] === "-v")
  ) {
    const meta =
      typeof command.meta === "function"
        ? await command.meta()
        : await command.meta;
    if (!meta?.version) {
      throw new StormError({ code: 8 });
    }

    consola.log(meta.version);
  } else {
    await runCommand(command, { rawArgs });
  }
} catch (error) {
  consola.error(error, "An unexpected error occurred");
  await shutdown(isStormError(error) ? error.code : 1);
}

`
          )
        )
      );
    } catch (error) {
      this.log(
        LogLevelLabel.ERROR,
        `Failed to prepare the entry artifact: ${error?.message}`
      );
      throw error;
    }
  }

  protected async prepareCommandDefinition(
    context: Context<TOptions>,
    command: CommandReflection
  ) {
    if (command.subCommands) {
      await Promise.all(
        Object.values(command.subCommands).map(async subCommand =>
          this.prepareCommandDefinition(context, subCommand)
        )
      );
    }

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
    );

    await this.writeFile(
      command.entry.file,
      `${getFileHeader()}

import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "${joinPaths(
        relativePath(
          findFilePath(command.entry.file),
          findFilePath(command.entry.input.file)
        ),
        findFileName(command.entry.input.file).replace(
          findFileExtension(command.entry.input.file),
          ""
        )
      )}";
import { builder } from "storm:app";
import { storage } from "storm:storage";
import { StormRequest } from "storm:request";
import { StormResponse } from "storm:response";
import { getSink as getStorageSink } from "@storm-stack/log-storage";${
        this.#config.features?.includes(StormStackNodeFeatures.SENTRY)
          ? `
import { getSink as getSentrySink } from "@storm-stack/log-sentry";`
          : ""
      }
import { defineCommand } from "@stryke/cli/define-command";
import { getAppVersion } from "storm:context";${
        command.subCommands && Object.keys(command.subCommands).length > 0
          ? Object.keys(command.subCommands)
              .map(key => `import ${key} from "./${key}";`)
              .join("\n")
          : ""
      }
import type { CommandContext } from "@stryke/cli/types";
import { deserialize } from "@deepkit/type";
import { ${command.argsTypeName} } from "${relativePath(
        findFilePath(command.entry.file),
        joinPaths(context.workspaceConfig.workspaceRoot, command.argsTypeImport)
      )}";

const handleCommand = builder<
  StormRequest<${command.argsTypeName}>,
  StormResponse<any>,
  CommandContext<any>,
  any
>({
  name: ${context.name ? `"${context.name}"` : "undefined"},
  log: [
    { handle: await getStorageSink({ storage }), logLevel: "debug" }${
      this.#config.features.includes(StormStackNodeFeatures.SENTRY)
        ? `,
    { handle: getSentrySink(), logLevel: "error" }`
        : ""
    }
  ],
  storage
})
  .handler(handle)
  .deserializer((payload: any) => new StormRequest(
    deserialize<${command.argsTypeName}>(payload.args)
  ))
  .build();

export default defineCommand({
  meta: {
    name: "${command.name}",
    displayName: "${command.displayName}",
    description: "${command.description}"
  },${
    command.args.length > 0
      ? `args: ${StormJSON.stringify(
          command.args.reduce((ret, arg) => {
            ret[arg.name] = {
              description: arg.description,
              type: arg.type,
              options: arg.options,
              required: arg.required,
              default:
                arg.type === "boolean"
                  ? Boolean(arg.default)
                  : arg.type === "number"
                    ? Number(arg.default)
                    : String(arg.default).replaceAll('"', "")
            };

            if (arg.type === "boolean") {
              ret[arg.name].negativeDescription =
                `The inverse of the "${arg.name}" argument.`;
            }

            return ret;
          }, {})
        )},`
      : ""
  }${
    command.subCommands && Object.keys(command.subCommands).length > 0
      ? `subCommands: {
      ${Object.keys(command.subCommands).join(", \n")}
  },`
      : ""
  }
  handle: handleCommand
})

`
    );
  }
}
