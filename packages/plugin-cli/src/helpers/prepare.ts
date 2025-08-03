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

import { ReflectionKind, stringifyType } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
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
import { snakeCase } from "@stryke/string-format/snake-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isString } from "@stryke/type-checks/is-string";
import {
  writeCompletionsBash,
  writeCompletionsZsh
} from "../templates/completions";
import {
  writeConfigDelete,
  writeConfigGet,
  writeConfigList,
  writeConfigSet
} from "../templates/config";
import type { CLIPluginConfig, CLIPluginContext } from "../types/config";
import type { Command, CommandTree } from "../types/reflection";
import {
  LARGE_CONSOLE_WIDTH,
  LARGE_HELP_COLUMN_WIDTH,
  MIN_CONSOLE_WIDTH
} from "./constants";
import { extractAuthor, sortArgAliases, sortArgs } from "./utilities";

async function writeCommandEntryUsage(
  log: LogFn,
  context: CLIPluginContext,
  command: Command,
  config: CLIPluginConfig,
  description: string
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry usage artifact ${command.entry.file} (${
      command.entry?.name ? `export: "${command.entry.name}"` : "default"
    })`
  );

  const commandsColumn1 = Object.values(command.children).map(child => {
    return `${child.name} (${child.name})`;
  });

  const commandsColumn2 = Object.values(command.children).map(child => {
    return `\${colors.gray("${child.type?.getDescription() || `The ${child.title} command.`}")}`;
  });

  if (!command?.payload?.args) {
    throw new Error(
      `Command "${command.id}" (${command.entry.file}) is missing payload.`
    );
  }

  const optionsColumn1 = sortArgs(command.payload.args).map(arg => {
    const names = sortArgAliases([arg.name, ...arg.type.getAlias()]);
    if (
      arg.type.getKind() === ReflectionKind.string ||
      arg.type.getKind() === ReflectionKind.literal ||
      arg.type.getKind() === ReflectionKind.number ||
      arg.type.getKind() === ReflectionKind.enum
    ) {
      return `${names
        .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
        .join(", ")} <${snakeCase(arg.name)}>`;
    } else if (arg.type.getKind() === ReflectionKind.array) {
      return `${names
        .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
        .join(", ")} <${snakeCase(arg.name)}>...`;
    }

    return names
      .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
      .join(", ");
  });

  const optionsColumn2 = command.payload.args.map(arg => {
    if (
      arg.type.getKind() === ReflectionKind.string ||
      arg.type.getKind() === ReflectionKind.literal ||
      arg.type.getKind() === ReflectionKind.number ||
      arg.type.getKind() === ReflectionKind.enum
    ) {
      return `\${colors.gray("${
        !arg.type.getDescription()
          ? `The ${arg.name} command-line option.`
          : !arg.type.getDescription().endsWith(".") &&
              !arg.type.getDescription().endsWith("?")
            ? `${arg.type.getDescription()}.`
            : arg.type.getDescription()
      }${
        arg.type.getKind() === ReflectionKind.enum &&
        arg.options &&
        arg.options.length > 0
          ? ` Valid options are: ${arg.options.join(", ")}`
          : ""
      }${
        arg.type.getDefaultValue() !== undefined
          ? ` [default: ${
              typeof arg.type.getDefaultValue() === "string"
                ? String(arg.type.getDefaultValue()).replaceAll('"', '\\"')
                : arg.type.getDefaultValue()
            }]`
          : ""
      }")}`;
    } else if (arg.type.getKind() === ReflectionKind.array) {
      return `\${colors.gray("${
        !arg.type.getDescription()
          ? `The ${arg.name} command-line option.`
          : !arg.type.getDescription().endsWith(".") &&
              !arg.type.getDescription().endsWith("?")
            ? `${arg.type.getDescription()}.`
            : arg.type.getDescription()
      }${
        arg.type.getDefaultValue() !== undefined
          ? ` [default: ${
              typeof arg.type.getDefaultValue() === "string"
                ? String(arg.type.getDefaultValue()).replaceAll('"', '\\"')
                : arg.type.getDefaultValue()
            }]`
          : ""
      }")}`;
    }

    return `${`\${colors.gray("${
      !arg.type.getDescription()
        ? `The ${arg.name} command-line option.`
        : !arg.type.getDescription().endsWith(".") &&
            !arg.type.getDescription().endsWith("?")
          ? `${arg.type.getDescription()}.`
          : arg.type.getDescription()
    }`}${
      arg.type.getDefaultValue() !== undefined &&
      arg.type.getDefaultValue() !== false
        ? ` [default: ${arg.type.getDefaultValue()}]`
        : ""
    }")}`;
  });

  const column1MaxLength =
    Math.max(
      ...[
        Math.max(...commandsColumn1.map(child => child.length)),
        Math.max(...optionsColumn1.map(option => option.length))
      ]
    ) + 6;

  await context.vfs.writeEntryFile(
    command.entry.file.replace(findFileName(command.entry.file), "usage.ts"),
    `${getFileHeader()}

import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "${joinPaths(
      relativePath(
        findFilePath(command.entry.file),
        findFilePath(command.entry.input.file)
      ),
      findFileName(command.entry.input.file).replace(
        findFileExtension(command.entry.input.file) || "",
        ""
      )
    )}";
import { colors } from "storm:cli";${
      command.payload.import
        ? `import { ${command.payload.import.name} } from "${relativePath(
            findFilePath(command.entry.file),
            joinPaths(
              context.options.workspaceRoot,
              command.payload.import.file
            )
          )}";`
        : `

        `
    }

/**
 * Renders the ${command.title} command usage information.
 *
 * @param mode - The render mode to use when displaying the usage information (either "full" or "minimal").
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(mode: "full" | "minimal" = "full"): string {
  const consoleWidth = Math.max(process.stdout.columns - 2, ${MIN_CONSOLE_WIDTH});
  const isLargeConsole = consoleWidth >= ${LARGE_CONSOLE_WIDTH};

  return \`\${colors.white(\`\${colors.whiteBright(colors.bold(\`${command.title.toUpperCase()}\${mode === "minimal" ? " COMMAND:" : ""}\`))}${
    command.type?.getDescription()
      ? `

  \${colors.gray("${description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("USAGE:"))}
    \${colors.cyan(colors.bold(\`$ ${kebabCase(command.root.name)}${
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
      `    $ ${kebabCase(command.root.name)}${
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
    }\`))} ${
      Object.values(command.children).length > 0
        ? `\${mode === "full" ? \`
  \${colors.whiteBright(colors.bold("COMMANDS:"))}
${commandsColumn1
  .map(
    (child, i) =>
      `     \${isLargeConsole ? "${child}".padEnd(${LARGE_HELP_COLUMN_WIDTH}) : "${child}".padEnd(${
        column1MaxLength
      })}${commandsColumn2[i]}`
  )
  .join("\n")}\` : ""}`
        : ""
    }

  \${colors.whiteBright(colors.bold("OPTIONS:"))}
\${colors.cyan(colors.bold(\`${optionsColumn1
      .map(
        (option, i) =>
          `    \${isLargeConsole ? "${option}".padEnd(${LARGE_HELP_COLUMN_WIDTH}) : "${option}".padEnd(${
            column1MaxLength
          })}${optionsColumn2[i]}`
      )
      .join(" \n")}\`))}
\`)}\`;
}

`
  );
}

async function writeCommandEntryHandler(
  log: LogFn,
  context: CLIPluginContext,
  command: Command,
  config: CLIPluginConfig,
  description: string
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry handler artifact ${command.entry.file} (${
      command.entry?.name ? `export: "${command.entry.name}"` : "default"
    })" from input "${command.entry.input.file}" (${
      command.entry.input.name
        ? `export: "${command.entry.input.name}"`
        : "default"
    })`
  );

  await context.vfs.writeEntryFile(
    command.entry.file,
    `${getFileHeader()}

import { renderUsage } from "./usage";
import ${
      command.entry.input.name
        ? `{ ${command.entry.input.name} as handle }`
        : "handle"
    } from "${joinPaths(
      relativePath(
        findFilePath(command.entry.file),
        findFilePath(command.entry.input.file)
      ),
      findFileName(command.entry.input.file).replace(
        findFileExtension(command.entry.input.file) || "",
        ""
      )
    )}";
import { withContext } from "storm:app";
import { isInteractive, isMinimal } from "storm:env";
import { colors, parseArgs, renderBanner, renderFooter${
      config.interactive !== "never" ? ", prompt" : ""
    } } from "storm:cli";
import { deserialize, serialize } from "@deepkit/type";${
      command.payload.import
        ? `import { ${command.payload.import.name} } from "${relativePath(
            findFilePath(command.entry.file),
            joinPaths(
              context.options.workspaceRoot,
              command.payload.import.file
            )
          )}";`
        : `

export interface ${command.payload.type.getName()} {
  ${command.payload.args.map(arg => `${camelCase(arg.name)}: ${stringifyType(arg.type.getType())};`).join("\n  ")}
}
        `
    }

const handleCommand = withContext<${command.payload.type.getName()}>(handle);

/**
 * The entry point for the ${command.title} command.
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
        console.log(renderFooter());
        console.log("");

        return;
      }
    }`
        : ""
    }

    const args = parseArgs(process.argv.slice(${command.entry.path.length + 1}), {${
      command.payload.args.filter(
        arg => arg.type.getKind() === ReflectionKind.boolean
      ).length > 0
        ? `
      boolean: [${command.payload.args
        .filter(arg => arg.type.getKind() === ReflectionKind.boolean)
        .map(arg => `"${arg.name}", "${arg.type.getAlias().join('", "')}"`)
        .join(", ")}],`
        : ""
    }${
      command.payload.args.filter(arg => arg.type.getAlias().length > 0)
        .length > 0
        ? `
      alias: {${command.payload.args
        .map(
          arg =>
            `${camelCase(arg.name)}: [ "${arg.name}", "${arg.name.toUpperCase()}", ${arg.type
              .getAlias()
              .map(alias => `"${alias}", "${alias.toUpperCase()}"`)
              .join(", ")}]`
        )
        .join(",\n ")}},`
        : ""
    }
    });

    if (args["version"] || args["v"]) {
      console.log($storm.config.APP_VERSION);
    } else {
      const isVerbose = args["verbose"] ?? Boolean(process.env.${constantCase(command.root.name)}_VERBOSE);
      ${
        config.interactive !== "never"
          ? `const isPromptEnabled = ((args["interactive"] !== false &&
        args["no-interactive"] !== true) &&
        Boolean(process.env.${constantCase(command.root.name)}_INTERACTIVE)) &&
        isInteractive &&
        !isMinimal;`
          : ""
      }

      if (args["no-banner"] !== true && !isMinimal) {
        console.log(renderBanner("${command.title} Command", "${description}"));
        console.log("");
      }

      if (args["help"] || args["h"] || args["?"]) {
        console.log(renderUsage("full"));
        console.log(renderFooter());
        console.log("");
      } else {
        if (isVerbose) {
          console.log(colors.dim(\` > Writing verbose output to console - as a result of the \${args["verbose"] ? "user provided \\"verbose\\" option" : "${constantCase(
            command.root.name
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
            if (args["${arg.name}"] === undefined && process.env.${constantCase(command.root.name)}_${constantCase(arg.name)}) {
              args["${arg.name}"] = process.env.${constantCase(command.root.name)}_${constantCase(arg.name)};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to \${process.env.${constantCase(
                  command.root.name
                )}_${constantCase(arg.name)}} (via the ${constantCase(
                  command.root.name
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
                config.interactive !== "never" && !arg.isNegativeOf
                  ? `
              if (isPromptEnabled) {
                args["${arg.name}"] = await prompt<${stringifyType(arg.type.getType())}>(\`Please ${
                  arg.type.getKind() === ReflectionKind.boolean
                    ? `confirm the ${arg.title} value`
                    : `${arg.type.getKind() === ReflectionKind.enum && arg.options && arg.options.length > 0 ? "select" : "provide"} ${
                        arg.title.startsWith("a") ||
                        arg.title.startsWith("A") ||
                        arg.title.startsWith("e") ||
                        arg.title.startsWith("E") ||
                        arg.title.startsWith("i") ||
                        arg.title.startsWith("I") ||
                        arg.title.startsWith("o") ||
                        arg.title.startsWith("O") ||
                        arg.title.startsWith("u") ||
                        arg.title.startsWith("U") ||
                        arg.title.startsWith("y") ||
                        arg.title.startsWith("Y")
                          ? "an"
                          : "a"
                      } ${
                        arg.title.toLowerCase() === "value" ||
                        arg.title.toLowerCase() === "name"
                          ? arg.title
                          : `${arg.title} value`
                      }`
                }${
                  arg.type.getDescription() &&
                  (arg.type.getKind() === ReflectionKind.boolean ||
                    (arg.type.getKind() === ReflectionKind.enum &&
                      arg.options &&
                      arg.options.length > 0))
                    ? ` \${colors.gray("(${arg.type.getDescription()})")}`
                    : ""
                }\`, {
                  type: "${
                    arg.type.getKind() === ReflectionKind.boolean
                      ? "confirm"
                      : arg.type.getKind() === ReflectionKind.enum &&
                          arg.options &&
                          arg.options.length > 0
                        ? arg.type.getKind() === ReflectionKind.array
                          ? "multiselect"
                          : "select"
                        : "text"
                  }", ${
                    arg.type.getDefaultValue() !== undefined
                      ? `
                      initial: ${
                        arg.type.getKind() === ReflectionKind.number
                          ? `"${arg.type.getDefaultValue()}"`
                          : arg.type.getDefaultValue()
                      }, ${
                        arg.type.getKind() === ReflectionKind.string ||
                        arg.type.getKind() === ReflectionKind.number
                          ? `
                      default: ${
                        arg.type.getKind() === ReflectionKind.string
                          ? `"${arg.type.getDefaultValue()}"`
                          : arg.type.getDefaultValue()
                      }, `
                          : ""
                      }`
                      : ""
                  }${
                    arg.type.getKind() !== ReflectionKind.boolean &&
                    arg.type.getKind() !== ReflectionKind.enum &&
                    arg.type.getDescription()
                      ? `
                      placeholder: "${arg.type.getDescription()}", `
                      : ""
                  }${
                    arg.type.getKind() !== ReflectionKind.enum &&
                    arg.options &&
                    arg.options.length > 0
                      ? `
                  options: [ ${arg.options.map(option => `"${option}"`).join(", ")} ], `
                      : ""
                  }
                });
              }

              ${
                arg.type.getDefaultValue() !== undefined
                  ? `
              if (args["${arg.name}"] === undefined) { `
                  : ""
              }
                `
                  : ""
              }${
                arg.type.getDefaultValue() !== undefined
                  ? `
              args["${arg.name}"] = ${arg.type.getDefaultValue()};
              if (isVerbose) {
                console.log(colors.dim(\` > Setting the ${arg.name} option to ${arg.type.getDefaultValue()} (via it's default value) \`));
              }
            ${config.interactive !== "never" && !arg.isNegativeOf ? " } " : ""} `
                  : ""
              }
          } `;
            })
            .join("\n")}

        await handleCommand(deserialize<${command.payload.type.getName()}>(args));
      }
    }
  } catch (err) {
   console.error(\` \${colors.red("✘")} \${colors.white(\`Error occurred while processing ${command.title} command.\`)}\`);
  }
}

export default handler;

`
  );
}

async function writeCommandEntry(
  log: LogFn,
  context: CLIPluginContext,
  command: Command,
  config: CLIPluginConfig
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

  const description =
    !command.type?.getDescription()?.endsWith(".") &&
    !command.type?.getDescription()?.endsWith("?")
      ? `${command.type?.getDescription()}.`
      : command.type?.getDescription();

  await writeCommandEntryUsage(log, context, command, config, description);
  await writeCommandEntryHandler(log, context, command, config, description);
}

async function writeVirtualCommandEntry(
  log: LogFn,
  context: CLIPluginContext,
  command: Command,
  _config: CLIPluginConfig
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the virtual command entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

  const optionsColumn1 = sortArgs(command.payload.args).map(arg => {
    const names = sortArgAliases([arg.name, ...arg.type.getAlias()]);
    if (
      arg.type.getKind() === ReflectionKind.string ||
      arg.type.getKind() === ReflectionKind.literal ||
      arg.type.getKind() === ReflectionKind.number ||
      arg.type.getKind() === ReflectionKind.enum
    ) {
      return `${names
        .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
        .join(", ")} <${snakeCase(arg.name)}>`;
    } else if (arg.type.getKind() === ReflectionKind.array) {
      return `${names
        .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
        .join(", ")} <${snakeCase(arg.name)}>...`;
    }

    return names
      .map(name => (name.length === 1 ? `-${name}` : `--${name}`))
      .join(", ");
  });

  const optionsColumn2 = command.payload.args.map(arg => {
    if (
      arg.type.getKind() === ReflectionKind.string ||
      arg.type.getKind() === ReflectionKind.literal ||
      arg.type.getKind() === ReflectionKind.number ||
      arg.type.getKind() === ReflectionKind.enum
    ) {
      return `${
        arg.type.getDescription()
          ? `\${colors.gray("${
              !arg.type.getDescription()?.endsWith(".") &&
              !arg.type.getDescription()?.endsWith("?")
                ? `${arg.type.getDescription()}.`
                : arg.type.getDescription()
            }`
          : ""
      }${
        arg.type.getKind() === ReflectionKind.enum &&
        arg.options &&
        arg.options.length > 0
          ? ` Valid options are: ${arg.options.join(", ")}`
          : ""
      }${
        arg.type.getDefaultValue() !== undefined
          ? ` [default: ${
              typeof arg.type.getDefaultValue() === "string"
                ? String(arg.type.getDefaultValue()).replaceAll('"', '\\"')
                : arg.type.getDefaultValue()
            }]`
          : ""
      }")}`;
    } else if (arg.type.getKind() === ReflectionKind.array) {
      return `${
        arg.type.getDescription()
          ? `\${colors.gray("${
              !arg.type.getDescription()?.endsWith(".") &&
              !arg.type.getDescription()?.endsWith("?")
                ? `${arg.type.getDescription()}.`
                : arg.type.getDescription()
            }`
          : ""
      }${
        arg.type.getDefaultValue() !== undefined
          ? ` [default: ${
              typeof arg.type.getDefaultValue() === "string"
                ? String(arg.type.getDefaultValue()).replaceAll('"', '\\"')
                : arg.type.getDefaultValue()
            }]`
          : ""
      }")}`;
    }

    return `${
      arg.type.getDescription()
        ? `\${colors.gray("${
            !arg.type.getDescription()?.endsWith(".") &&
            !arg.type.getDescription()?.endsWith("?")
              ? `${arg.type.getDescription()}.`
              : arg.type.getDescription()
          }`
        : ""
    }${arg.type.getDefaultValue() !== undefined && arg.type.getDefaultValue() !== false ? ` [default: ${arg.type.getDefaultValue()}]` : ""}")}`;
  });

  const column1MaxLength =
    Math.max(...optionsColumn1.map(option => option.length)) + 6;

  const description = !command.type?.getDescription()
    ? `The ${command.title} set of commands used by the ${
        command.root.title ? `${command.root.title}` : "command-line"
      } application.`
    : !command.type?.getDescription()?.endsWith(".") &&
        !command.type?.getDescription()?.endsWith("?")
      ? `${command.type?.getDescription()}.`
      : command.type?.getDescription();

  await context.vfs.writeEntryFile(
    command.entry.file,
    `${getFileHeader()}

import ${command.entry.input.name ? `{ ${command.entry.input.name} as handle }` : "handle"} from "${joinPaths(
      relativePath(
        findFilePath(command.entry.file),
        findFilePath(command.entry.input.file)
      ),
      findFileName(command.entry.input.file).replace(
        findFileExtension(command.entry.input.file) || "",
        ""
      )
    )}";
import { isMinimal } from "storm:env";
import { colors, renderBanner, renderFooter, parseArgs } from "storm:cli";${
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

export interface ${command.payload.type.getName()} {
  ${command.payload.args
    .map(arg => `${camelCase(arg.name)}: ${stringifyType(arg.type.getType())};`)
    .join("\n  ")}
}

/**
 * Renders the ${command.title} virtual command usage information.
 *
 * @param mode - The render mode to use when displaying the usage information (either "full" or "minimal").
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(mode: "full" | "minimal" = "full"): string {
  const consoleWidth = Math.max(process.stdout.columns - 2, ${MIN_CONSOLE_WIDTH});
  const isLargeConsole = consoleWidth >= ${LARGE_CONSOLE_WIDTH};

  return \`\${colors.whiteBright(colors.bold("${command.title.toUpperCase()} COMMANDS:"))} ${
    command.type?.getDescription()
      ? `

  \${colors.gray("${description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("USAGE:"))}
${
  Object.values(command.children).length > 0
    ? Object.values(command.children)
        .map(
          child =>
            `    $ ${kebabCase(command.root.bin[0]!)}${
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

  \${colors.whiteBright(colors.bold("COMMANDS:"))}
${Object.values(command.children)
  .map(
    child =>
      `\${render${pascalCase(child.name)}Usage("minimal").split("\\n").map(line => \`    \${line}\`).join("\\n")}`
  )
  .join("\n\n")}\` : ""}`
        : ""
    }

  \${colors.whiteBright(colors.bold("OPTIONS:"))}
\${colors.cyan(colors.bold(\`${optionsColumn1.map((option, i) => `    \${isLargeConsole ? "${option}".padEnd(${LARGE_HELP_COLUMN_WIDTH}) : "${option}".padEnd(${column1MaxLength})}${optionsColumn2[i]}`).join(" \n")}\`))}
\`;
}

/**
 * The entry point for the ${titleCase(command.name)} virtual command.
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
        console.log(renderFooter());
        console.log("");

        return;
      }
    }`
        : ""
    }

    const args = parseArgs(process.argv.slice(${command.entry.path.length + 1}), {${
      command.payload.args.filter(
        arg => arg.type.getKind() === ReflectionKind.boolean
      ).length > 0
        ? `
      boolean: [${command.payload.args
        .filter(arg => arg.type.getKind() === ReflectionKind.boolean)
        .map(arg => `"${arg.name}", "${arg.type.getAlias().join('", "')}"`)
        .join(", ")}],`
        : ""
    }${
      command.payload.args.filter(arg => arg.type.getAlias().length > 0)
        .length > 0
        ? `
      alias: {${command.payload.args
        .map(
          arg =>
            `${camelCase(arg.name)}: [ "${arg.name}", "${arg.name.toUpperCase()}", ${arg.type
              .getAlias()
              .map(alias => `"${alias}", "${alias.toUpperCase()}"`)
              .join(", ")}]`
        )
        .join(",\n ")}},`
        : ""
    }
    });

    if (args["version"] || args["v"]) {
      console.log($storm.config.APP_VERSION);
    } else {
      if (args["no-banner"] !== true && !isMinimal) {
        console.log(renderBanner("${command.title} Commands", "${description}"));
        console.log("");
      }

      console.log(renderUsage("full"));
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
   console.error(\` \${colors.red("✘")} \${colors.white(\`Error occurred while processing ${
     command.title
   } command.\`)}\`);
  }
}

export default handler;

`
  );
}

async function prepareCommandDefinition(
  log: LogFn,
  context: CLIPluginContext,
  command: Command,
  config: CLIPluginConfig
) {
  if (command.children) {
    for (const subCommand of Object.values(command.children)) {
      await prepareCommandDefinition(log, context, subCommand, config);
    }
  }

  log(
    LogLevelLabel.TRACE,
    `Preparing the entry artifact ${command.entry.file} (${
      command.entry?.name ? `export: "${command.entry.name}"` : "default"
    }) from input "${command.entry.input.file}" (${
      command.entry.input.name
        ? `export: "${command.entry.input.name}"`
        : "default"
    })`
  );

  if (command.entry.isVirtual) {
    return writeVirtualCommandEntry(log, context, command, config);
  }

  return writeCommandEntry(log, context, command, config);
}

export async function generateConfigCommands(
  log: LogFn,
  context: CLIPluginContext,
  config: CLIPluginConfig
) {
  if (config.manageConfig === false) {
    log(
      LogLevelLabel.TRACE,
      "Skipping config command generation since `manageConfig` is false."
    );
  } else {
    await Promise.all([
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "config", "get", "handle.ts"),
        writeConfigGet(context)
      ),
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "config", "set", "handle.ts"),
        writeConfigSet(context)
      ),
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "config", "list", "handle.ts"),
        writeConfigList(context)
      ),
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "config", "delete", "handle.ts"),
        writeConfigDelete(context)
      )
    ]);
  }
}

export async function generateCompletionCommands(
  log: LogFn,
  context: CLIPluginContext,
  config: CLIPluginConfig
) {
  if (config.manageConfig === false) {
    log(
      LogLevelLabel.TRACE,
      "Skipping config command generation since `manageConfig` is false."
    );
  } else {
    await Promise.all([
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "completions", "bash", "handle.ts"),
        writeCompletionsBash(context, config)
      ),
      context.vfs.writeEntryFile(
        joinPaths(context.entryPath, "completions", "zsh", "handle.ts"),
        writeCompletionsZsh(context, config)
      )
    ]);
  }
}

export async function prepareEntry(
  log: LogFn,
  context: CLIPluginContext,
  config: CLIPluginConfig,
  commandTree: CommandTree
): Promise<CommandTree> {
  // const commandTree = await readCommandTreeReflection(context, config);

  for (const command of Object.values(commandTree.children)) {
    await prepareCommandDefinition(log, context, command, config);
  }

  let appTitle = titleCase(
    context.options.name ||
      (Array.isArray(config.bin) ? config.bin[0] : config.bin) ||
      context.packageJson?.name
  );
  if (!appTitle.toLowerCase().endsWith("cli")) {
    appTitle += " CLI";
  }

  let description = context.options.description;
  if (!description) {
    if (context.packageJson?.description) {
      description = context.packageJson.description;
    }
    if (!description) {
      description = `The ${appTitle.replace(/.*(?:CLI|cli)$/, "")} command line interface (CLI) application.`;
    }
  }

  let repository = context.options.repository;
  if (!repository) {
    if (context.options.repository) {
      repository = context.options.repository;
    } else if (context.packageJson?.repository) {
      repository = isString(context.packageJson.repository)
        ? context.packageJson.repository
        : context.packageJson.repository?.url;
    }
  }

  const author = extractAuthor(context, config);

  await context.vfs.writeEntryFile(
    commandTree.entry.file,
    `#!/usr/bin/env ${
      context.options.mode === "development"
        ? "-S NODE_OPTIONS=--enable-source-maps"
        : ""
    } node

${getFileHeader()}

import { colors, link, renderBanner, renderFooter, parseArgs } from "storm:cli";
import { isMinimal, isUnicodeSupported } from "storm:env";
import { isError, isStormError, createStormError } from "storm:error";${
      commandTree.children && Object.values(commandTree.children).length > 0
        ? Object.values(commandTree.children)
            .map(child =>
              child.entry.isVirtual
                ? `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(child.name)}Usage } from "./entry/${child.entry.path.join("/")}";`
                : `import { renderUsage as render${pascalCase(child.name)}Usage } from "./entry/${child.entry.path.join("/")}/usage";`
            )
            .join("\n")
        : ""
    }

// Exit early if on an older version of Node.js (< ${config.minNodeVersion})
// const major = process.versions.node.split(".").map(Number)[0]!;
// if (major < ${config.minNodeVersion}) {
//   console.error(\` \${colors.red("✘")} \${colors.white(\`${titleCase(context.options.name)} CLI requires Node.js version ${config.minNodeVersion} or newer.
// You are running Node.js v\${process.versions.node}.
// Please upgrade Node.js - \${link("https://nodejs.org/en/download/")}
// \`)}\`,
//   );
//   process.exit(1);
// }

async function main() {
  ${
    !context.packageJson.private
      ? `
  try {
    /*

    if (config.disableUpdateCheck) {
      return;
    }

    const currentTime = Date.now();

    const configFileData = readConfigFile();
    if (configFileData.lastUpdateCheck && currentTime - configFileData.lastUpdateCheck < 24 * 60 * 60 * 1000) {
      return;
    }

    const response = await fetch("https://registry.npmjs.org/${context.packageJson.name || context.options.name}/latest");

    const latestVersion = (await response.json()).version;
    if ($storm.config.APP_VERSION === latestVersion) {
      return;
    }

    console.warn(colors.white(\`  \${colors.bold(colors.yellow("⚠"))} \${colors.bold(\`${
      appTitle.toLowerCase().startsWith("a") ||
      appTitle.toLowerCase().startsWith("e") ||
      appTitle.toLowerCase().startsWith("i") ||
      appTitle.toLowerCase().startsWith("o") ||
      appTitle.toLowerCase().startsWith("u") ||
      appTitle.toLowerCase().startsWith("y")
        ? "An"
        : "A"
    } ${appTitle} update is available! \${colors.red($storm.config.APP_VERSION)} 🢂 \${colors.green(latestVersion)}\`)}

    Release Notes: \${link("${
      repository
        ? repository.replace(/\.git$/, "").replace(/^git:/, "")
        : `https://github.com/${author?.name || "storm-software"}/${
            context.options.namespace ||
            context.options.name ||
            context.packageJson.name
          }/releases/tag/${
            context.projectJson?.name || context.options.name
          }@\${latestVersion}`
    }")}

    Run \${colors.bold("npm i -g ${context.packageJson.name || context.options.name}@latest")} \`));
    console.log("");

    updateConfigFile({
      lastUpdateCheck: currentTime,
    });*/
  } catch (err) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`An error occurred while checking for ${
      appTitle
    } application updates. You can disable update check by setting configuration parameter "SKIP_UPDATE_CHECK" to true: \n\n\${createStormError(err).toDisplay()}\`)}\`);
    console.log("");
  }
`
      : ""
  }

  try {
    if (process.argv.includes("--version") || process.argv.includes("-v")) {
      console.log($storm.config.APP_VERSION);
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
            : `const handle = await import("./entry/${child.entry.path.join("/")}").then(m => m.default);
        return handle();`
        }
      } `
        )
        .join(" ")} else {
        console.error(\` \${colors.red("✘")} \${colors.white(\`Unknown command: \${colors.bold(command || "<none>")}\`)}\`);
        console.log("");
      }

      if (!isMinimal) {
        console.log(renderBanner("Help Information", "Display usage details, commands, and support information for the ${
          appTitle
        } application"));
        console.log("");
      }

      ${
        description
          ? `
      const consoleWidth = Math.max(process.stdout.columns - 2, 80);
      console.log(\`\${" ".repeat((consoleWidth - ${description.length}) / 2)}${
        description
      }\${" ".repeat((consoleWidth - ${description.length}) / 2)}\`);
      console.log("");
      console.log("");`
          : ""
      }
      console.log(colors.gray("The following commands are available as part of the ${appTitle} application: "));${
        commandTree.children && Object.values(commandTree.children).length > 0
          ? Object.values(commandTree.children)
              .map(
                child =>
                  `
      console.log("");
      console.log(render${pascalCase(child.name)}Usage("minimal"));`
              )
              .join("\n")
          : ""
      }

      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`An error occurred while running the ${
      appTitle
    } application: \n\n\${createStormError(err).toDisplay()}\`)}\`);
  }
}

await main();

`
  );

  return commandTree;
}

export async function addCommandArgReflections(
  context: CLIPluginContext,
  command: Command
) {
  for (const arg of command.payload.args) {
    let name = constantCase(arg.name);
    const aliasProperties = context.reflections.configDotenv
      ?.getProperties()
      .filter(prop => prop.getAlias().length > 0);

    const prefix = context.options.plugins.dotenv.prefix.find(
      pre =>
        name &&
        name.startsWith(pre) &&
        (context.reflections.configDotenv?.hasProperty(
          name.replace(`${pre}_`, "")
        ) ??
          aliasProperties?.some(prop =>
            prop.getAlias().includes(name.replace(`${pre}_`, ""))
          ))
    );
    if (prefix) {
      name = name.replace(`${prefix}_`, "");
    }

    if (
      !context.reflections.configDotenv?.hasProperty(name) &&
      !aliasProperties?.some(prop => prop.getAlias().includes(name))
    ) {
      context.reflections.configDotenv?.addProperty({
        name: constantCase(arg.name),
        optional: true,
        description: arg.type.getDescription(),
        type: arg.type.getType(),
        default: arg.type.getDefaultValue(),
        tags: {
          domain: "cli",
          alias:
            arg.type.getAlias().filter(alias => alias.length > 1).length > 0
              ? arg.type
                  .getAlias()
                  .filter(alias => alias.length > 1)
                  .map(alias => constantCase(alias))
              : undefined
        }
      });
    }
  }

  if (command.children) {
    for (const subCommand of Object.values(command.children)) {
      await addCommandArgReflections(context, subCommand);
    }
  }
}
