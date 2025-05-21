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

import type { ReflectionClass } from "@deepkit/type";
import { deserializeType } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveDotenvReflection } from "@storm-stack/core/helpers/dotenv/resolve";
import {
  writeDotenvProperties,
  writeDotenvReflection
} from "@storm-stack/core/helpers/dotenv/write-reflections";
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { Context, Options } from "@storm-stack/core/types/build";
import type { LogFn } from "@storm-stack/core/types/config";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { constantCase } from "@stryke/string-format/constant-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { writeRuntime } from "../runtime/cli";
import type { StormStackCLIPresetConfig } from "../types/config";
import type { CommandReflectionTreeBranch } from "../types/reflection";
import { reflectCommandTree } from "./reflect-command";

async function prepareCommandDefinition<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflectionTreeBranch,
  config: StormStackCLIPresetConfig
) {
  if (command.children) {
    for (const subCommand of Object.values(command.children)) {
      await prepareCommandDefinition(log, context, subCommand, config);
    }
  }

  log(
    LogLevelLabel.TRACE,
    `Preparing the entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

  const runtimeRelativePath = relativePath(
    findFilePath(command.entry.file),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime"
    )
  );

  const commandsColumn1 = Object.values(command.children).map(child => {
    return `${child.displayName} (${child.name})`;
  });

  const commandsColumn2 = Object.values(command.children).map(child => {
    return `\${colors.dim("${child.description}")}`;
  });

  const optionsColumn1 = command.payload.args.map(arg => {
    if (arg.type === "string" || arg.type === "number" || arg.type === "enum") {
      return `--${arg.name} <${arg.name}>${
        arg.aliases.length > 0
          ? `, ${arg.aliases
              .map(alias =>
                alias.length === 1
                  ? `-${alias} <${arg.name}>`
                  : `--${alias} <${arg.name}>`
              )
              .join(", ")}`
          : ""
      }`;
    } else if (arg.type === "array") {
      return `--${arg.name} <${arg.name}>...${
        arg.aliases.length > 0
          ? `, ${arg.aliases
              .map(alias =>
                alias.length === 1
                  ? `-${alias} <${arg.name}>...`
                  : `--${alias} <${arg.name}>...`
              )
              .join(", ")}`
          : ""
      }`;
    }

    return `--${arg.name}${
      arg.aliases.length > 0
        ? `, ${arg.aliases
            .map(alias => (alias.length === 1 ? `-${alias}` : `--${alias}`))
            .join(", ")}`
        : ""
    }`;
  });

  const optionsColumn2 = command.payload.args.map(arg => {
    if (arg.type === "string" || arg.type === "number" || arg.type === "enum") {
      return `${
        arg.description
          ? `\${colors.dim("${
              !arg.description?.endsWith(".") && !arg.description?.endsWith("?")
                ? `${arg.description}.`
                : arg.description
            }`
          : ""
      }${
        arg.type === "enum" && arg.options && arg.options.length > 0
          ? ` Valid options are: ${arg.options.join(", ")}`
          : ""
      }${
        arg.default !== undefined
          ? ` [default: ${typeof arg.default === "string" ? arg.default.replaceAll('"', '\\"') : arg.default}]`
          : ""
      }")}`;
    } else if (arg.type === "array") {
      return `${
        arg.description
          ? `\${colors.dim("${
              !arg.description?.endsWith(".") && !arg.description?.endsWith("?")
                ? `${arg.description}.`
                : arg.description
            }`
          : ""
      }${
        arg.default !== undefined
          ? ` [default: ${
              typeof arg.default === "string"
                ? arg.default.replaceAll('"', '\\"')
                : arg.default
            }]`
          : ""
      }")}`;
    }

    return `${
      arg.description
        ? `\${colors.dim("${
            !arg.description?.endsWith(".") && !arg.description?.endsWith("?")
              ? `${arg.description}.`
              : arg.description
          }`
        : ""
    }${arg.default !== undefined ? ` [default: ${arg.default}]` : ""}")}`;
  });

  const column1MaxLength =
    Math.max(
      ...[
        Math.max(...commandsColumn1.map(child => child.length)),
        Math.max(...optionsColumn1.map(option => option.length))
      ]
    ) + 2;

  const binName =
    (config.bin &&
    (isSetString(config.bin) ||
      (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
      ? isSetString(config.bin)
        ? config.bin
        : config.bin[0]
      : context.options.name || context.packageJson?.name) || "cli";

  const bannerTitle = `${context.options.name ? `${titleCase(context.options.name)} - ` : ""}${command.displayName}`;

  await writeFile(
    log,
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
import { withContext } from "${joinPaths(runtimeRelativePath, "app")}";
import { getRuntimeInfo } from "${joinPaths(runtimeRelativePath, "env")}";
import { colors${config.interactive !== "never" ? ", prompt" : ""} } from "${joinPaths(runtimeRelativePath, "cli")}";${
      command.children && Object.values(command.children).length > 0
        ? Object.values(command.children)
            .map(
              child =>
                `import handle${pascalCase(child.name)} from "./${child.name}";`
            )
            .join("\n")
        : ""
    }
import { deserialize, serialize } from "@deepkit/type";${
      command.payload.importPath
        ? `import { ${command.payload.name} } from "${relativePath(
            findFilePath(command.entry.file),
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              command.payload.importPath
            )
          )}";`
        : `

export interface ${command.payload.name} {
  ${command.payload.args.map(arg => `${camelCase(arg.name)}: ${arg.stringifiedType};`).join("\n  ")}
}
        `
    }

/**
 * Renders the ${command.displayName} command usage information.
 *
 * @param includeCommands - Whether to include rendering sub-commands.
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(includeCommands = true) {
  return \`\${colors.bold("${command.displayName}")}${
    command.description
      ? `

  \${colors.dim("${command.description}")}
`
      : ""
  }
  \${colors.bold("Usage:")}
    ${kebabCase(binName)} ${command.path.join(" ")} [options] ${
      Object.values(command.children).length > 0
        ? `
${Object.values(command.children)
  .map(child => `    ${kebabCase(binName)} ${child.path.join(" ")} [options]`)
  .join("\n")}`
        : ""
    }${
      Object.values(command.children).length > 0
        ? `\${includeCommands !== false ? \`
  \${colors.bold("Commands:")}
${commandsColumn1
  .map(
    (child, i) => `    ${child.padEnd(column1MaxLength)}${commandsColumn2[i]}`
  )
  .join("\n")}\` : ""}`
        : ""
    }

  \${colors.bold("Options:")}
${optionsColumn1.map((option, i) => `    ${option.padEnd(column1MaxLength)}${optionsColumn2[i]}`).join(" \n")}
\`;
}

const handleCommand = withContext<${command.payload.name}>(handle);

/**
 * The entry point for the ${command.displayName} command.
 */
async function handler() {
  try {
    ${
      Object.values(command.children).length > 0
        ? `if (process.argv.length > ${command.path.length + 2}) {
      const command = process.argv[${command.path.length + 1}];
      if (command && !command.startsWith("-")) {
      ${Object.values(command.children)
        .map(
          (child, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.name.toLowerCase()}") {
          return handle${pascalCase(child.name)}();
    } `
        )
        .join(" ")}

        console.error(colors.red(\`Unknown command: \${colors.bold(command || "")}\`));
        console.log("");
        console.log(renderUsage());
        console.log("");

        return;
      }
    }`
        : ""
    }

    const args = parseArgs(process.argv.slice(${command.path.length + 1}), {${
      command.payload.args.filter(arg => arg.type === "boolean").length > 0
        ? `
      boolean: [${command.payload.args
        .filter(arg => arg.type === "boolean")
        .map(arg => `"${arg.name}", "${arg.aliases.join('", "')}"`)
        .join(", ")}],`
        : ""
    }${
      command.payload.args.filter(arg => arg.aliases.length > 0).length > 0
        ? `
      alias: {${command.payload.args
        .map(
          arg =>
            `${camelCase(arg.name)}: [ "${arg.name}", "${arg.name.toUpperCase()}", ${arg.aliases
              .map(alias => `"${alias}", "${alias.toUpperCase()}"`)
              .join(", ")}]`
        )
        .join(",\n ")}},`
        : ""
    }
    });

    if (args["version"] || args["v"]) {
      console.log($storm.vars.APP_VERSION);
    } else {
      const consoleWidth = Math.max(process.stdout.columns - 2, 46);
      const runtimeInfo = getRuntimeInfo();

      const isVerbose = args["verbose"] ?? Boolean(process.env.${constantCase(binName)}_VERBOSE);
      ${
        config.interactive !== "never"
          ? `const isInteractive = ((args["interactive"] !== false &&
        args["no-interactive"] !== true) &&
        Boolean(process.env.${constantCase(binName)}_INTERACTIVE)) &&
        runtimeInfo.isInteractive &&
        !runtimeInfo.isCI;`
          : ""
      }

      if (args["no-banner"] !== true && !runtimeInfo.isCI) {
        const width = Math.max(Math.min(consoleWidth, ${Math.max(bannerTitle.length + 2, 40)}), 44);

        const banner = [];
        banner.push(colors.cyan(\`┏━━━━ ${binName} ━━ v${context.packageJson.version || "1.0.0"} \${"━".repeat(width - 10 - ${binName.length + (context.packageJson.version?.length ?? 5)})}┓\`));
        banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
        banner.push(\`\${colors.cyan("┃")}\${" ".repeat((width - ${bannerTitle.length}) / 2)}\${colors.whiteBright(colors.bold("${bannerTitle}"))}\${" ".repeat((width - ${bannerTitle.length}) / 2)}\${colors.cyan("┃")}\`);
        banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
        banner.push(colors.cyan(\`┗\${"━".repeat(width)}┛\`));

        console.log(banner.map(bannerline => \`\${" ".repeat((consoleWidth - bannerline.length) / 2)}\${bannerline}\${" ".repeat((consoleWidth - bannerline.length) / 2)}\`).join("\\n"));
      }

      if (args["help"] || args["h"] || args["?"]) {
        console.log("");
        console.log(renderUsage());
        console.log("");
      } else {
        if (isVerbose) {
          console.log(colors.dim(\` > Writing verbose output to console - as a result of the \${args["verbose"] ? "user provided \\"verbose\\" option" : "${constantCase(binName)}_VERBOSE environment variable"} \`));
          console.log("");
          ${
            config.interactive !== "never"
              ? `
          if (isInteractive) {
            console.log(colors.dim(" > Running in interactive mode..."));
          } else {
            console.log(colors.dim(" > Running in non-interactive mode..."));
          }

          console.log("");  `
              : ""
          }
        }

        ${Object.values(command.payload.args)
          .filter(
            arg =>
              ![
                "help",
                "version",
                "interactive",
                "no-interactive",
                "verbose",
                "no-banner"
              ].includes(arg.name)
          )
          .map(arg => {
            return `
            if (args["${arg.name}"] === undefined && process.env.${constantCase(binName)}_${constantCase(arg.name)}) {
              args["${arg.name}"] = process.env.${constantCase(binName)}_${constantCase(arg.name)};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to \${process.env.${constantCase(binName)}_${constantCase(arg.name)}} (via the ${constantCase(binName)}_${constantCase(arg.name)} environment variable) \`));
              }
            } `;
          })
          .join("\n")}

          ${Object.values(command.payload.args)
            .filter(
              arg =>
                ![
                  "help",
                  "version",
                  "interactive",
                  "no-interactive",
                  "verbose",
                  "no-banner"
                ].includes(arg.name)
            )
            .map(arg => {
              return `
            if (args["${arg.name}"] === undefined) {
              ${
                config.interactive !== "never"
                  ? `
              if (isInteractive) {
                args["${arg.name}"] = await prompt<${arg.stringifiedType}>("${arg.description || `Please provide a value for the ${arg.displayName} option`}", {
                  type: "${arg.type === "boolean" ? "confirm" : arg.type === "enum" ? (arg.array ? "multiselect" : "select") : "text"}", ${
                    arg.default !== undefined
                      ? `
                      initial: ${arg.type === "number" ? `"${arg.default}"` : arg.default}, ${
                        arg.type === "string" || arg.type === "number"
                          ? `
                      default: ${arg.type === "number" ? `"${arg.default}"` : arg.default}, `
                          : ""
                      } `
                      : ""
                  } ${
                    arg.type === "enum" && arg.options && arg.options.length > 0
                      ? `
                  options: [ ${arg.options.map(option => `"${option}"`).join(", ")} ], `
                      : ""
                  }
                });
              } else {
                args["${arg.name}"] = ${arg.default};
                if (isVerbose) {
                  console.log(colors.dim(\` > Setting the ${arg.name} option to ${arg.default} (via it's default value) \`));
                }
              }
                `
                  : `
              args["${arg.name}"] = ${arg.default};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to ${arg.default} (via it's default value) \`));
              } `
              }
            } `;
            })
            .join("\n")}

        await handleCommand(deserialize<${command.payload.name}>(args));
      }
    }
  } catch (err) {
    console.error(colors.red("Error occurred while processing ${command.displayName} command."));
  }
}

export default handler;

`
  );
}

async function addCommandArgReflections(
  reflection: ReflectionClass<any>,
  command: CommandReflectionTreeBranch
) {
  command.payload.args.forEach(arg => {
    if (!reflection.hasProperty(constantCase(arg.name))) {
      reflection.addProperty({
        name: constantCase(arg.name),
        optional: true,
        description: arg.description,
        type: deserializeType(arg.reflectionType)
      });
    }
  });

  if (command.children) {
    for (const subCommand of Object.values(command.children)) {
      await addCommandArgReflections(reflection, subCommand);
    }
  }
}

export async function prepareRuntime<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  await writeFile(
    log,
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli.ts"
    ),
    writeRuntime(config)
  );
}

export async function prepareEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  const commandTree = await reflectCommandTree(log, context, config);

  const varsReflection = await resolveDotenvReflection(context, "variables");
  for (const command of Object.values(commandTree.children)) {
    log(
      LogLevelLabel.TRACE,
      `Reflecting command arguments for "${commandTree.name}"`
    );

    await addCommandArgReflections(varsReflection, command);
  }

  context.dotenv.types.variables.reflection = varsReflection;
  await writeDotenvReflection(log, context, varsReflection, "variables");
  await writeDotenvProperties(
    log,
    context,
    "variables",
    varsReflection.getProperties()
  );

  for (const command of Object.values(commandTree.children)) {
    await prepareCommandDefinition(log, context, command, config);
  }

  await writeFile(
    log,
    commandTree.entry.file,
    `#!/usr/bin/env node

${getFileHeader()}

import { colors } from "./runtime/cli";
import { isError } from "@stryke/type-checks/is-error";${
      commandTree.children && Object.values(commandTree.children).length > 0
        ? Object.values(commandTree.children)
            .map(
              child =>
                `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(child.name)}Usage } from "./commands/${child.path.join("/")}";`
            )
            .join("\n")
        : ""
    }

async function main() {
  try {
    if (process.argv.includes("--version") || process.argv.includes("-v")) {
      console.log($storm.vars.APP_VERSION);
    } else {
      let command = "";
      if (process.argv.length > 2 && process.argv[2]) {
        command = process.argv[2];
      }

      ${Object.values(commandTree.children)
        .map(
          (command, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${command.name.toLowerCase()}") {
        return handle${pascalCase(command.name)}();
      }`
        )
        .join(" ")} else {
        console.error(colors.red(\`Unknown command: \${colors.bold(command)}\`));
      }

      console.log("");
      console.log("The following commands are available as part of the ${context.options.name} application:");
      console.log("");
      ${
        commandTree.children && Object.values(commandTree.children).length > 0
          ? Object.values(commandTree.children)
              .map(
                child => `console.log(render${pascalCase(child.name)}Usage());`
              )
              .join("\n")
          : ""
      }
      console.log("");
    }
  } catch (err) {
    if (isError(err)) {
      console.error(colors.red(\`Error occurred while processing command: \${err.message}\`));
    } else {
      console.error(colors.red(\`Unknown error occurred: \${err}\`));
    }
  }
}

await main();

`
  );
}

export async function prepareTypes<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  const typesDir = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    context.artifactsDir,
    "types"
  );

  const relativeCLIRuntimeDir = relativePath(
    typesDir,
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
  );

  await writeFile(
    log,
    joinPaths(typesDir, "modules-cli.d.ts"),
    `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}

declare module "storm:cli" {
  const parseArgs: (typeof import("${relativeCLIRuntimeDir}"))["parseArgs"];
  const colors: (typeof import("${relativeCLIRuntimeDir}"))["colors"];
  const getColor: (typeof import("${relativeCLIRuntimeDir}"))["getColor"];
  const link: (typeof import("${relativeCLIRuntimeDir}"))["link"];${
    config.interactive !== "never"
      ? `
  const prompt: (typeof import("${relativeCLIRuntimeDir}"))["prompt"];`
      : ""
  }

  export {${config.interactive !== "never" ? " prompt," : ""} parseArgs, colors, getColor, link };
}

`
  );

  await writeFile(
    log,
    joinPaths(typesDir, "global-cli.d.ts"),
    `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}

declare global {
  const parseArgs: (typeof import("${relativeCLIRuntimeDir}"))["parseArgs"];

  const colors: (typeof import("${relativeCLIRuntimeDir}"))["colors"];
  const getColor: (typeof import("${relativeCLIRuntimeDir}"))["getColor"];
  type ColorName = import("${relativeCLIRuntimeDir}").ColorName;

  const link: (typeof import("${relativeCLIRuntimeDir}"))["link"];
  type LinkOptions = import("${relativeCLIRuntimeDir}").LinkOptions;  ${
    config.interactive !== "never"
      ? `

  const prompt: (typeof import("${relativeCLIRuntimeDir}"))["prompt"];
  type TextPromptOptions = import("${relativeCLIRuntimeDir}").TextPromptOptions;
  type ConfirmPromptOptions = import("${relativeCLIRuntimeDir}").ConfirmPromptOptions;
  type SelectPromptOptions = import("${relativeCLIRuntimeDir}").SelectPromptOptions;
  type MultiSelectPromptOptions = import("${relativeCLIRuntimeDir}").MultiSelectPromptOptions;`
      : ""
  }
}

export {};

`
  );
}
