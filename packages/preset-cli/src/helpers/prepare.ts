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
import { writeApp } from "../runtime/app";
import { writeRuntime } from "../runtime/cli";
import {
  writeCompletionsBash,
  writeCompletionsZsh
} from "../runtime/completions";
import {
  writeVarsDelete,
  writeVarsGet,
  writeVarsList,
  writeVarsSet
} from "../runtime/vars";
import type { StormStackCLIPresetContext } from "../types/build";
import type { StormStackCLIPresetConfig } from "../types/config";
import type { CommandReflectionTreeBranch } from "../types/reflection";
import { reflectCommandTree } from "./reflect-command";

async function writeCommandEntryUsage<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflectionTreeBranch,
  config: StormStackCLIPresetConfig,
  name: string,
  description: string
) {
  const runtimeRelativePath = relativePath(
    findFilePath(command.entry.file),
    context.runtimePath,
    false
  );

  const commandsColumn1 = Object.values(command.children).map(child => {
    return `${child.displayName} (${child.name})`;
  });

  const commandsColumn2 = Object.values(command.children).map(child => {
    return `\${colors.gray("${child.description}")}`;
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
              .sort((a, b) => b.localeCompare(a))
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
              .sort((a, b) => b.localeCompare(a))
              .join(", ")}`
          : ""
      }`;
    }

    return `--${arg.name}${
      arg.aliases.length > 0
        ? `, ${arg.aliases
            .map(alias => (alias.length === 1 ? `-${alias}` : `--${alias}`))
            .sort((a, b) => b.localeCompare(a))
            .join(", ")}`
        : ""
    }`;
  });

  const optionsColumn2 = command.payload.args.map(arg => {
    if (arg.type === "string" || arg.type === "number" || arg.type === "enum") {
      return `\${colors.gray("${
        !arg.description
          ? `The ${arg.name} command-line option.`
          : !arg.description.endsWith(".") && !arg.description.endsWith("?")
            ? `${arg.description}.`
            : arg.description
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
      return `\${colors.gray("${
        !arg.description
          ? `The ${arg.name} command-line option.`
          : !arg.description.endsWith(".") && !arg.description.endsWith("?")
            ? `${arg.description}.`
            : arg.description
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

    return `${`\${colors.gray("${
      !arg.description
        ? `The ${arg.name} command-line option.`
        : !arg.description.endsWith(".") && !arg.description.endsWith("?")
          ? `${arg.description}.`
          : arg.description
    }`}${arg.default !== undefined ? ` [default: ${arg.default}]` : ""}")}`;
  });

  const column1MaxLength =
    Math.max(
      ...[
        Math.max(...commandsColumn1.map(child => child.length)),
        Math.max(...optionsColumn1.map(option => option.length))
      ]
    ) + 6;

  await writeFile(
    log,
    command.entry.file.replace(findFileName(command.entry.file), "usage.ts"),
    `${getFileHeader()}

import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "./${joinPaths(
      relativePath(
        findFilePath(command.entry.file),
        findFilePath(command.entry.input.file)
      ),
      findFileName(command.entry.input.file).replace(
        findFileExtension(command.entry.input.file),
        ""
      )
    )}";
import { colors } from "${joinPaths(runtimeRelativePath, "cli")}";${
      command.payload.importPath
        ? `import { ${command.payload.name} } from "${relativePath(
            findFilePath(command.entry.file),
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              command.payload.importPath
            )
          )}";`
        : `

        `
    }

/**
 * Renders the ${command.displayName} command usage information.
 *
 * @param mode - The render mode to use when displaying the usage information (either "full" or "minimal").
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(mode: "full" | "minimal" = "full"): string {
  return \`\${colors.whiteBright(colors.bold(\`${command.displayName}\${mode === "minimal" ? " Command" : ""}\`))}${
    command.description
      ? `

  \${colors.gray("${description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("Usage:"))}
    ${kebabCase(name)}${
      command.entry.path.length > 0
        ? ` ${command.entry.path
            .filter(Boolean)
            .map(part => part.replace("[", "<").replace("]", ">"))
            .join(" ")}`
        : ""
    } [options] ${
      Object.values(command.children).length > 0
        ? `
${Object.values(command.children)
  .map(
    child =>
      `    ${kebabCase(name)}${
        child.entry.path.length > 0
          ? ` ${child.entry.path
              .filter(Boolean)
              .map(part => part.replace("[", "<").replace("]", ">"))
              .join(" ")}`
          : ""
      } [options]`
  )
  .join("\n")}`
        : ""
    }${
      Object.values(command.children).length > 0
        ? `\${mode === "full" ? \`
  \${colors.whiteBright(colors.bold("Commands:"))}
${commandsColumn1
  .map(
    (child, i) => `    ${child.padEnd(column1MaxLength)}${commandsColumn2[i]}`
  )
  .join("\n")}\` : ""}`
        : ""
    }

  \${colors.whiteBright(colors.bold("Options:"))}
${optionsColumn1.map((option, i) => `    ${option.padEnd(column1MaxLength)}${optionsColumn2[i]}`).join(" \n")}
\`;
}

`
  );
}

async function writeCommandEntryHandler<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflectionTreeBranch,
  config: StormStackCLIPresetConfig,
  name: string,
  description: string
) {
  const runtimeRelativePath = relativePath(
    findFilePath(command.entry.file),
    context.runtimePath,
    false
  );

  await writeFile(
    log,
    command.entry.file,
    `${getFileHeader()}

import { renderUsage } from "./usage";
import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "./${joinPaths(
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
import { isInteractive, isMinimal } from "${joinPaths(runtimeRelativePath, "env")}";
import { colors, parseArgs, renderBanner, renderFooter${config.interactive !== "never" ? ", prompt" : ""} } from "${joinPaths(runtimeRelativePath, "cli")}";
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

const handleCommand = withContext<${command.payload.name}>(handle);

/**
 * The entry point for the ${command.displayName} command.
 */
async function handler() {
  try {
    ${
      Object.values(command.children).length > 0
        ? `if (process.argv.length > ${command.entry.path.length + 2}) {
      const command = process.argv[${command.entry.path.length + 1}];
      if (command && !command.startsWith("-")) {
        ${Object.values(command.children)
          .map(
            (child, i) =>
              `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.name.toLowerCase()}") {
          ${
            child.entry.isVirtual
              ? `return handle${pascalCase(child.name)}();`
              : `const handle = await import("./${child.name}").then(m => m.default);
          return handle();`
          }
        } `
          )
          .join(" ")}

        console.error(\` \${colors.red("✘")} \${colors.white(\`Unknown command: \${colors.bold(command || "<none>")}\`)}\`);
        console.log("");
        console.log(renderUsage("full"));
        console.log("");
        console.log(renderFooter());
        console.log("");

        return;
      }
    }`
        : ""
    }

    const args = parseArgs(process.argv.slice(${command.entry.path.length + 1}), {${
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
      const isVerbose = args["verbose"] ?? Boolean(process.env.${constantCase(name)}_VERBOSE);
      ${
        config.interactive !== "never"
          ? `const isPromptEnabled = ((args["interactive"] !== false &&
        args["no-interactive"] !== true) &&
        Boolean(process.env.${constantCase(name)}_INTERACTIVE)) &&
        isInteractive &&
        !isMinimal;`
          : ""
      }

      if (args["no-banner"] !== true && !isMinimal) {
        console.log(renderBanner("${command.displayName} Command", "${description}"));
        console.log("");
      }

      if (args["help"] || args["h"] || args["?"]) {
        console.log(renderUsage("full"));
        console.log("");
        console.log(renderFooter());
        console.log("");
      } else {
        if (isVerbose) {
          console.log(colors.dim(\` > Writing verbose output to console - as a result of the \${args["verbose"] ? "user provided \\"verbose\\" option" : "${constantCase(
            name
          )}_VERBOSE environment variable"} \`));
          console.log("");
          ${
            config.interactive !== "never"
              ? `
          if (isPromptEnabled) {
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
            if (args["${arg.name}"] === undefined && process.env.${constantCase(name)}_${constantCase(arg.name)}) {
              args["${arg.name}"] = process.env.${constantCase(name)}_${constantCase(arg.name)};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to \${process.env.${constantCase(
                  name
                )}_${constantCase(arg.name)}} (via the ${constantCase(
                  name
                )}_${constantCase(arg.name)} environment variable) \`));
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
                config.interactive !== "never" && !arg.isNegative
                  ? `
              if (isPromptEnabled) {
                args["${arg.name}"] = await prompt<${arg.stringifiedType}>(\`Please ${
                  arg.type === "boolean"
                    ? `confirm the ${arg.displayName} value`
                    : `${arg.type === "enum" && arg.options && arg.options.length > 0 ? "select" : "provide"} ${
                        arg.displayName.startsWith("a") ||
                        arg.displayName.startsWith("A") ||
                        arg.displayName.startsWith("e") ||
                        arg.displayName.startsWith("E") ||
                        arg.displayName.startsWith("i") ||
                        arg.displayName.startsWith("I") ||
                        arg.displayName.startsWith("o") ||
                        arg.displayName.startsWith("O") ||
                        arg.displayName.startsWith("u") ||
                        arg.displayName.startsWith("U") ||
                        arg.displayName.startsWith("y") ||
                        arg.displayName.startsWith("Y")
                          ? "an"
                          : "a"
                      } ${
                        arg.displayName.toLowerCase() === "value" ||
                        arg.displayName.toLowerCase() === "name"
                          ? arg.displayName
                          : `${arg.displayName} value`
                      }`
                }${
                  arg.description &&
                  (arg.type === "boolean" ||
                    (arg.type === "enum" &&
                      arg.options &&
                      arg.options.length > 0))
                    ? ` \${colors.gray("(${arg.description})")}`
                    : ""
                }\`, {
                  type: "${arg.type === "boolean" ? "confirm" : arg.type === "enum" && arg.options && arg.options.length > 0 ? (arg.array ? "multiselect" : "select") : "text"}", ${
                    arg.default !== undefined
                      ? `
                      initial: ${arg.type === "number" ? `"${arg.default}"` : arg.default}, ${
                        arg.type === "string" || arg.type === "number"
                          ? `
                      default: ${arg.type === "number" ? `"${arg.default}"` : arg.default}, `
                          : ""
                      }`
                      : ""
                  }${
                    arg.type !== "boolean" &&
                    arg.type !== "enum" &&
                    arg.description
                      ? `
                      placeholder: "${arg.description}", `
                      : ""
                  }${
                    arg.type === "enum" && arg.options && arg.options.length > 0
                      ? `
                  options: [ ${arg.options.map(option => `"${option}"`).join(", ")} ], `
                      : ""
                  }
                });
              }

              ${
                arg.default !== undefined
                  ? `
              if (args["${arg.name}"] === undefined) { `
                  : ""
              }
                `
                  : ""
              }${
                arg.default !== undefined
                  ? `
              args["${arg.name}"] = ${arg.default};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to ${arg.default} (via it's default value) \`));
              }
            ${config.interactive !== "never" && !arg.isNegative ? " } " : ""} `
                  : ""
              }
          } `;
            })
            .join("\n")}

        await handleCommand(deserialize<${command.payload.name}>(args));
      }
    }
  } catch (err) {
   console.error(\` \${colors.red("✘")} \${colors.white(\`Error occurred while processing ${command.displayName} command.\`)}\`);
  }
}

export default handler;

`
  );
}

async function writeCommandEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflectionTreeBranch,
  config: StormStackCLIPresetConfig
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

  const name =
    (config.bin &&
    (isSetString(config.bin) ||
      (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
      ? isSetString(config.bin)
        ? config.bin
        : config.bin[0]
      : context.options.name || context.packageJson?.name) || "cli";
  const description =
    !command.description?.endsWith(".") && !command.description?.endsWith("?")
      ? `${command.description}.`
      : command.description;

  await writeCommandEntryUsage(
    log,
    context,
    command,
    config,
    name,
    description
  );
  await writeCommandEntryHandler(
    log,
    context,
    command,
    config,
    name,
    description
  );
}

async function writeVirtualCommandEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflectionTreeBranch,
  config: StormStackCLIPresetConfig
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the virtual command entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

  const runtimeRelativePath = relativePath(
    findFilePath(command.entry.file),
    context.runtimePath,
    false
  );

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
              .sort((a, b) => b.localeCompare(a))
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
              .sort((a, b) => b.localeCompare(a))
              .join(", ")}`
          : ""
      }`;
    }

    return `--${arg.name}${
      arg.aliases.length > 0
        ? `, ${arg.aliases
            .map(alias => (alias.length === 1 ? `-${alias}` : `--${alias}`))
            .sort((a, b) => b.localeCompare(a))
            .join(", ")}`
        : ""
    }`;
  });

  const optionsColumn2 = command.payload.args.map(arg => {
    if (arg.type === "string" || arg.type === "number" || arg.type === "enum") {
      return `${
        arg.description
          ? `\${colors.gray("${
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
          ? `\${colors.gray("${
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
        ? `\${colors.gray("${
            !arg.description?.endsWith(".") && !arg.description?.endsWith("?")
              ? `${arg.description}.`
              : arg.description
          }`
        : ""
    }${arg.default !== undefined ? ` [default: ${arg.default}]` : ""}")}`;
  });

  const column1MaxLength =
    Math.max(...optionsColumn1.map(option => option.length)) + 6;

  const binName =
    (config.bin &&
    (isSetString(config.bin) ||
      (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
      ? isSetString(config.bin)
        ? config.bin
        : config.bin[0]
      : context.options.name || context.packageJson?.name) || "cli";
  const description =
    !command.description?.endsWith(".") && !command.description?.endsWith("?")
      ? `${command.description}.`
      : command.description;

  await writeFile(
    log,
    command.entry.file,
    `${getFileHeader()}

import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "./${joinPaths(
      relativePath(
        findFilePath(command.entry.file),
        findFilePath(command.entry.input.file)
      ),
      findFileName(command.entry.input.file).replace(
        findFileExtension(command.entry.input.file),
        ""
      )
    )}";
import { isMinimal } from "${joinPaths(runtimeRelativePath, "env")}";
import { colors, renderBanner, renderFooter, parseArgs } from "${joinPaths(runtimeRelativePath, "cli")}";${
      command.children && Object.values(command.children).length > 0
        ? Object.values(command.children)
            .map(child =>
              child.entry.isVirtual
                ? `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(child.name)}Usage } from "./${child.name}";`
                : `import { renderUsage as render${pascalCase(child.name)}Usage } from "./${child.name}/usage";`
            )
            .join("\n")
        : ""
    }

export interface ${command.payload.name} {
  ${command.payload.args.map(arg => `${camelCase(arg.name)}: ${arg.stringifiedType};`).join("\n  ")}
}

/**
 * Renders the ${command.displayName} virtual command usage information.
 *
 * @param mode - The render mode to use when displaying the usage information (either "full" or "minimal").
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(mode: "full" | "minimal" = "full"): string {
  return \`\${colors.whiteBright(colors.bold("${command.displayName} Commands"))} ${
    command.description
      ? `

  \${colors.gray("${description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("Usage:"))}
${
  Object.values(command.children).length > 0
    ? Object.values(command.children)
        .map(
          child =>
            `    ${kebabCase(binName)}${
              child.entry.path.length > 0
                ? ` ${child.entry.path
                    .filter(Boolean)
                    .map(part => part.replace("[", "<").replace("]", ">"))
                    .join(" ")}`
                : ""
            } [options]`
        )
        .join("\n")
    : ""
}${
      Object.values(command.children).length > 0
        ? `\${mode === "full" ? \`

  \${colors.whiteBright(colors.bold("Commands:"))}
${Object.values(command.children)
  .map(
    child =>
      `\${render${pascalCase(child.name)}Usage("minimal").split("\\n").map(line => \`    \${line}\`).join("\\n")}`
  )
  .join("\n\n")}\` : ""}`
        : ""
    }

  \${colors.whiteBright(colors.bold("Options:"))}
${optionsColumn1.map((option, i) => `    ${option.padEnd(column1MaxLength)}${optionsColumn2[i]}`).join(" \n")}
\`;
}

/**
 * The entry point for the ${command.displayName} virtual command.
 */
async function handler() {
  try {
    ${
      Object.values(command.children).length > 0
        ? `if (process.argv.length > ${command.entry.path.length + 2}) {
      const command = process.argv[${command.entry.path.length + 1}];
      if (command && !command.startsWith("-")) {
      ${Object.values(command.children)
        .map(
          (child, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.name.toLowerCase()}") {
          ${
            child.entry.isVirtual
              ? `return handle${pascalCase(child.name)}();`
              : `const handle = await import("./${child.name}").then(m => m.default);
          return handle();`
          }
        } `
        )
        .join(" ")}

        console.error(\` \${colors.red("✘")} \${colors.white(\`Unknown command: \${colors.bold(command || "<none>")}\`)}\`);
        console.log("");
        console.log(renderUsage("full"));
        console.log("");
        console.log(renderFooter());
        console.log("");

        return;
      }
    }`
        : ""
    }

    const args = parseArgs(process.argv.slice(${command.entry.path.length + 1}), {${
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
      if (args["no-banner"] !== true && !isMinimal) {
        console.log(renderBanner("${command.displayName} Commands", "${description}"));
        console.log("");
      }

      console.log(renderUsage("full"));
      console.log("");
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
   console.error(\` \${colors.red("✘")} \${colors.white(\`Error occurred while processing ${
     command.displayName
   } command.\`)}\`);
  }
}

export default handler;

`
  );
}

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

  if (command.entry.isVirtual) {
    return writeVirtualCommandEntry(log, context, command, config);
  }

  return writeCommandEntry(log, context, command, config);
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

async function generateVarsCommands<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
) {
  if (config.manageVars === false) {
    log(
      LogLevelLabel.TRACE,
      "Skipping vars command generation since `manageVars` is false."
    );
  } else {
    await Promise.all([
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "vars",
          "get",
          "handle.ts"
        ),
        writeVarsGet(context)
      ),
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "vars",
          "set",
          "handle.ts"
        ),
        writeVarsSet(context)
      ),
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "vars",
          "list",
          "handle.ts"
        ),
        writeVarsList(context)
      ),
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "vars",
          "delete",
          "handle.ts"
        ),
        writeVarsDelete(context)
      )
    ]);
  }
}

async function generateCompletionCommands<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
) {
  if (config.manageVars === false) {
    log(
      LogLevelLabel.TRACE,
      "Skipping vars command generation since `manageVars` is false."
    );
  } else {
    await Promise.all([
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "completions",
          "bash",
          "handle.ts"
        ),
        writeCompletionsBash(context, config)
      ),
      writeFile(
        log,
        joinPaths(
          context.artifactsPath,
          "commands",
          "completions",
          "zsh",
          "handle.ts"
        ),
        writeCompletionsZsh(context, config)
      )
    ]);
  }
}

export async function prepareRuntime<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
) {
  await Promise.all([
    writeFile(
      log,
      joinPaths(context.runtimePath, "app.ts"),
      writeApp(context, config)
    ),
    writeFile(
      log,
      joinPaths(context.runtimePath, "cli.ts"),
      writeRuntime(context, config)
    ),
    generateVarsCommands(log, context, config),
    generateCompletionCommands(log, context, config)
  ]);
}

export async function prepareEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
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

  let description = context.options.description;
  if (!description) {
    if (context.packageJson?.description) {
      description = context.packageJson.description;
    }
  }

  await writeFile(
    log,
    commandTree.entry.file,
    `#!/usr/bin/env ${
      context.options.mode === "development"
        ? "-S NODE_OPTIONS=--enable-source-maps node"
        : "node"
    }

${getFileHeader()}

import { colors, link, renderBanner, renderFooter, parseArgs } from "./runtime/cli";
import { isMinimal, isUnicodeSupported } from "./runtime/env";
import { isError, isStormError, createStormError } from "./runtime/error";${
      commandTree.children && Object.values(commandTree.children).length > 0
        ? Object.values(commandTree.children)
            .map(child =>
              child.entry.isVirtual
                ? `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(child.name)}Usage } from "./commands/${child.entry.path.join("/")}";`
                : `import { renderUsage as render${pascalCase(child.name)}Usage } from "./commands/${child.entry.path.join("/")}/usage";`
            )
            .join("\n")
        : ""
    }

// Exit early if on an older version of Node.js (< 22)
const major = process.versions.node.split(".").map(Number)[0]!;
if (major < 22) {
  console.error(
    "\\n" +
      "${titleCase(context.options.name)} CLI requires Node.js version 22 or newer. \\n" +
      \`You are running Node.js v\${process.versions.node}. \\n\` +
      \`Please upgrade Node.js: \${link("https://nodejs.org/en/download/")} \\n\`,
  );
  process.exit(1);
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
          (child, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.name.toLowerCase()}") {
        ${
          child.entry.isVirtual
            ? `return handle${pascalCase(child.name)}();`
            : `const handle = await import("./commands/${child.entry.path.join("/")}").then(m => m.default);
        return handle();`
        }
      } `
        )
        .join(" ")} else {
        console.error(\` \${colors.red("✘")} \${colors.white(\`Unknown command: \${colors.bold(command || "<none>")}\`)}\`);
        console.log("");
      }

      if (!isMinimal) {
        console.log(renderBanner("Help Information", "Display usage details, commands, and support information for the ${context.options.name} application"));
        console.log("");
      }

      ${
        description
          ? `
      const consoleWidth = Math.max(process.stdout.columns - 2, 80);
      console.log(\`\${" ".repeat((consoleWidth - ${description.length}) / 2)}${description}\${" ".repeat((consoleWidth - ${description.length}) / 2)}\`);
      console.log("");
      console.log("");`
          : ""
      }
      console.log(colors.gray("The following commands are available as part of the ${context.options.name} application: "));
      console.log("");${
        commandTree.children && Object.values(commandTree.children).length > 0
          ? Object.values(commandTree.children)
              .map(
                child =>
                  `
      console.log(render${pascalCase(child.name)}Usage("minimal"));
      console.log("");`
              )
              .join("\n")
          : ""
      }

      console.log("");
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`An error occurred while running the ${context.options.name} application: \n\n\${createStormError(err).toDisplay()}\`)}\`);
  }
}

await main();

`
  );
}

// export async function prepareTypes<TOptions extends Options = Options>(
//   log: LogFn,
//   context: Context<TOptions>,
//   config: StormStackCLIPresetConfig
// ) {
//   const typesDir = joinPaths(context.artifactsPath, "types");

//   const relativeCLIRuntimeDir = relativePath(
//     typesDir,
//     joinPaths(context.runtimePath, "cli"),
//     false
//   );

//   await writeFile(
//     log,
//     joinPaths(typesDir, "modules-cli.d.ts"),
//     `${getFileHeader(`
// /// <reference types="@storm-stack/types" />
// /// <reference types="@storm-stack/types/node" />
// `)}

// declare module "storm:cli" {
//   const parseArgs: (typeof import("${relativeCLIRuntimeDir}"))["parseArgs"];
//   const colors: (typeof import("${relativeCLIRuntimeDir}"))["colors"];
//   const getColor: (typeof import("${relativeCLIRuntimeDir}"))["getColor"];
//   const link: (typeof import("${relativeCLIRuntimeDir}"))["link"];${
//     config.interactive !== "never"
//       ? `
//   const prompt: (typeof import("${relativeCLIRuntimeDir}"))["prompt"];`
//       : ""
//   }

//   export {${config.interactive !== "never" ? " prompt," : ""} parseArgs, colors, getColor, link };
// }

// `
//   );

//   await writeFile(
//     log,
//     joinPaths(typesDir, "global-cli.d.ts"),
//     `${getFileHeader(`
// /// <reference types="@storm-stack/types" />
// /// <reference types="@storm-stack/types/node" />
// `)}

// declare global {
//   const parseArgs: (typeof import("${relativeCLIRuntimeDir}"))["parseArgs"];

//   const colors: (typeof import("${relativeCLIRuntimeDir}"))["colors"];
//   const getColor: (typeof import("${relativeCLIRuntimeDir}"))["getColor"];
//   type ColorName = import("${relativeCLIRuntimeDir}").ColorName;

//   const link: (typeof import("${relativeCLIRuntimeDir}"))["link"];
//   type LinkOptions = import("${relativeCLIRuntimeDir}").LinkOptions;  ${
//     config.interactive !== "never"
//       ? `

//   const prompt: (typeof import("${relativeCLIRuntimeDir}"))["prompt"];
//   type TextPromptOptions = import("${relativeCLIRuntimeDir}").TextPromptOptions;
//   type ConfirmPromptOptions = import("${relativeCLIRuntimeDir}").ConfirmPromptOptions;
//   type SelectPromptOptions = import("${relativeCLIRuntimeDir}").SelectPromptOptions;
//   type MultiSelectPromptOptions = import("${relativeCLIRuntimeDir}").MultiSelectPromptOptions;`
//       : ""
//   }
// }

// export {};

// `
//   );
// }
