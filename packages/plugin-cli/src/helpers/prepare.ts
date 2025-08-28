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
import { ReflectionKind, stringifyType } from "@storm-stack/core/deepkit";
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
import type { CLIPluginContext } from "../types/config";
import type { CommandTree, CommandTreeBranch } from "../types/reflection";
import {
  LARGE_CONSOLE_WIDTH,
  LARGE_HELP_COLUMN_WIDTH,
  MIN_CONSOLE_WIDTH
} from "./constants";
import { extractAuthor, sortArgAliases, sortArgs } from "./utilities";

async function writeCommandEntryUsage(
  log: LogFn,
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  const command = cmd.command;
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry usage artifact ${command.file} (${
      command?.name ? `export: "${command.name}"` : "default"
    })`
  );

  const commandsColumn1 = Object.values(cmd.children).map(child => {
    return `${child.command.name} (${child.command.name})`;
  });

  const commandsColumn2 = Object.values(cmd.children).map(child => {
    return `\${colors.gray("${child.command.description}")}`;
  });

  const request = command.request;
  if (!request?.args || request.args.length === 0) {
    throw new Error(
      `Command "${command.id}" (${command.file}) is missing request.`
    );
  }

  const optionsColumn1 = sortArgs(request.args).map(arg => {
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

  const optionsColumn2 = sortArgs(request.args).map(arg => {
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
    command.file.replace(findFileName(command.file), "usage.ts"),
    `${getFileHeader()}

import ${command.input.name ? `{ ${command.input.name} as handle }` : "handle"} from "./${joinPaths(
      relativePath(
        findFilePath(command.file),
        findFilePath(command.input.file)
      ),
      findFileName(command.input.file).replace(
        findFileExtension(command.input.file) || "",
        ""
      )
    )}";
import { colors, showError } from "storm:cli";${
      request.import
        ? `import { ${request.import.name} } from "${relativePath(
            findFilePath(command.file),
            joinPaths(context.options.workspaceRoot, request.import.file)
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

  return \`\${colors.whiteBright(colors.bold(\`${command.title.toUpperCase()}\${mode === "minimal" ? " COMMAND:" : ""}\`))}${
    command.description
      ? `

  \${colors.gray("${command.description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("USAGE:"))}
    \${colors.brand(\`$ ${kebabCase(cmd.root.bin[0])}${
      command.path.length > 0
        ? ` ${command.path
            .filter(Boolean)
            .map(part => part.replace("[", "<").replace("]", ">"))
            .join(" ")}`
        : ""
    } [options] ${
      Object.values(cmd.children).length > 0
        ? `
${Object.values(cmd.children)
  .map(
    child =>
      `    $ ${kebabCase(child.root.bin[0])}${
        child.command.path.length > 0
          ? ` ${child.command.path
              .filter(Boolean)
              .map(part => part.replace("[", "<").replace("]", ">"))
              .join(" ")}`
          : ""
      } [options]`
  )
  .join("\n")}`
        : ""
    }\`)} ${
      Object.values(cmd.children).length > 0
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
${optionsColumn1
  .map(
    (option, i) =>
      `    \${colors.brand(isLargeConsole ? "${option}".padEnd(${LARGE_HELP_COLUMN_WIDTH}) : "${option}".padEnd(${
        column1MaxLength
      }))}${optionsColumn2[i]}`
  )
  .join(" \n")}\`;
}

`
  );
}

async function writeCommandEntryHandler(
  log: LogFn,
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  const command = cmd.command;
  const request = command.request;

  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry handler artifact ${command.file} (${
      command.name ? `export: "${command.name}"` : "default"
    })" from input "${command.input.file}" (${
      command.input.name ? `export: "${command.input.name}"` : "default"
    })`
  );

  await context.vfs.writeEntryFile(
    command.file,
    `${getFileHeader()}

import { renderUsage } from "./usage";
import ${
      command.input.name ? `{ ${command.input.name} as handle }` : "handle"
    } from "./${joinPaths(
      relativePath(
        findFilePath(command.file),
        findFilePath(command.input.file)
      ),
      findFileName(command.input.file).replace(
        findFileExtension(command.input.file) || "",
        ""
      )
    )}";
import { StormRequest } from "storm:request";
import { createStormError } from "storm:error";
import { CLIRequestData, showError, colors, parseArgs, renderBanner, renderFooter${
      context.options.plugins.cli.interactive !== "never" ? ", prompt" : ""
    } } from "storm:cli";
import { deserialize, serialize } from "@storm-stack/core/deepkit";${
      request.import
        ? `import { ${request.import.name} } from "${relativePath(
            findFilePath(command.file),
            joinPaths(context.options.workspaceRoot, request.import.file)
          )}";`
        : `

export interface ${request.type.getName()} extends CLIRequestData {
  ${request.args
    .map(arg => `${camelCase(arg.name)}: ${stringifyType(arg.type.getType())};`)
    .join("\n  ")}
}
        `
    }

/**
 * The entry point for the ${command.title} command.
 *
 * @param request - The request object containing the command arguments.
 */
async function handler(request: StormRequest<${request.type.getName()}>) {
  ${
    Object.values(cmd.children).length > 0
      ? `if (request.data.args.length > ${command.path.length + 2}) {
    const command = request.data.args[${command.path.length + 1}];
    if (command && !command.startsWith("-")) {
      ${Object.values(cmd.children)
        .map(
          (child, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.command.name.toLowerCase()}") {
        ${
          child.command.isVirtual
            ? `return handle${pascalCase(child.command.name)}();`
            : `const handle = await import("./${
                child.command.name
              }").then(m => m.default);
        return handle();`
        }
      } `
        )
        .join(" ")}

      showError(\`Unknown command: \${colors.bold(command || "<none>")}\`);
      console.log("");
      console.log(renderUsage("full"));
      console.log(renderFooter());
      console.log("");

      return;
    }
  }`
      : ""
  }

  const args = parseArgs(request.data.args.slice(${command.path.length + 1}), {${
    request.args.filter(arg => arg.type.getKind() === ReflectionKind.boolean)
      .length > 0
      ? `
    boolean: [${request.args
      .filter(arg => arg.name && arg.type.getKind() === ReflectionKind.boolean)
      .map(
        arg =>
          `${arg.name ? `"${arg.name}"` : ""}${
            arg.type.getAlias().length > 0
              ? `, ${arg.type
                  .getAlias()
                  .map(alias => `"${alias}"`)
                  .join(", ")}`
              : ""
          }`
      )
      .join(", ")}],`
      : ""
  }${
    request.args.filter(arg => arg.type.getAlias().length > 0).length > 0
      ? `
    alias: {${request.args
      .map(
        arg =>
          `${camelCase(arg.name)}: [${
            camelCase(arg.name) !== arg.name ? ` "${arg.name}",` : ""
          }${
            camelCase(arg.name) !== pascalCase(arg.name) &&
            arg.name !== pascalCase(arg.name)
              ? ` "${pascalCase(arg.name)}",`
              : ""
          } ${
            camelCase(arg.name) !== arg.name.toUpperCase() &&
            arg.name !== arg.name.toUpperCase() &&
            pascalCase(arg.name) !== arg.name.toUpperCase()
              ? ` "${arg.name.toUpperCase()}",`
              : ""
          } ${arg.type
            .getAlias()
            .filter(Boolean)
            .map(
              alias =>
                `"${alias}",${
                  alias !== camelCase(alias) ? ` "${camelCase(alias)}",` : ""
                }${
                  alias !== pascalCase(alias) &&
                  camelCase(alias) !== pascalCase(alias)
                    ? ` "${pascalCase(alias)}",`
                    : ""
                } ${
                  alias !== alias.toUpperCase() &&
                  camelCase(alias) !== alias.toUpperCase() &&
                  pascalCase(alias) !== alias.toUpperCase()
                    ? ` "${alias.toUpperCase()}",`
                    : ""
                }`
            )
            .join(", ")}]`
      )
      .join(",\n ")}},`
      : ""
  }
  });

  if (args["version"] || args["v"]) {
    console.log($storm.env.version);
  } else {
    const isVerbose = args["verbose"] ?? Boolean($storm.config.VERBOSE);
    ${
      context.options.plugins.cli.interactive !== "never"
        ? `const isPromptEnabled = ((args["interactive"] !== false &&
      args["no-interactive"] !== true) &&
      Boolean($storm.config.INTERACTIVE)) &&
      $storm.env.isInteractive &&
      !$storm.env.isMinimal;`
        : ""
    }

    if (args["no-banner"] !== true && !$storm.env.isMinimal) {
      console.log(renderBanner("${command.title} Command", "${command.description}"));
      console.log("");
    }

    if (args["help"] || args["h"] || args["?"]) {
      console.log(renderUsage("full"));
      console.log(renderFooter());
      console.log("");
    } else {
      if (isVerbose) {
        console.log(colors.dim(\` > Writing verbose output to console - as a result of the \${args["verbose"] ? "user provided \\"verbose\\" option" : "${constantCase(
          cmd.root.name
        )}_VERBOSE environment variable"} \`));
        console.log("");
        ${
          context.options.plugins.cli.interactive !== "never"
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

      ${Object.values(request.args)
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
          if (args["${arg.name}"] === undefined && $storm.config.${constantCase(arg.name)}) {
            args["${arg.name}"] = $storm.config.${constantCase(arg.name)};
            if (isVerbose) {
              console.log(colors.dim(\` > Setting the ${arg.name} option to \${$storm.config.${constantCase(
                arg.name
              )}} (via the ${constantCase(
                cmd.root.name
              )}_${constantCase(arg.name)} environment variable) \`));
            }
          } `;
        })
        .join("\n")}

        ${Object.values(request.args)
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
              context.options.plugins.cli.interactive !== "never" &&
              !arg.isNegativeOf
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
          ${
            context.options.plugins.cli.interactive !== "never" &&
            !arg.isNegativeOf
              ? " } "
              : ""
          } `
                : ""
            }
        } `;
          })
          .join("\n")}

      request.merge(deserialize<${request.type.getName()}>(args));
      await handle(request);
    }
  }
}

export default handler;

`
  );
}

async function writeCommandEntry(
  log: LogFn,
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  const command = cmd.command;
  log(
    LogLevelLabel.TRACE,
    `Preparing the command entry artifact ${command.file} (${
      command?.name ? `export: "${command.name}"` : "default"
    })" from input "${command.input.file}" (${
      command.input.name ? `export: "${command.input.name}"` : "default"
    })`
  );

  await writeCommandEntryUsage(log, context, cmd);
  await writeCommandEntryHandler(log, context, cmd);
}

async function writeVirtualCommandEntry(
  log: LogFn,
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  const command = cmd.command;
  const request = command.request;

  log(
    LogLevelLabel.TRACE,
    `Preparing the virtual command entry artifact ${command.file} (${
      command?.name ? `export: "${command.name}"` : "default"
    })" from input "${command.input.file}" (${
      command.input.name ? `export: "${command.input.name}"` : "default"
    })`
  );

  const optionsColumn1 = sortArgs(request.args).map(arg => {
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

  const optionsColumn2 = sortArgs(request.args).map(arg => {
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
    }${
      arg.type.getDefaultValue() !== undefined &&
      arg.type.getDefaultValue() !== false
        ? ` [default: ${arg.type.getDefaultValue()}]`
        : ""
    }")}`;
  });

  const column1MaxLength =
    Math.max(...optionsColumn1.map(option => option.length)) + 6;

  await context.vfs.writeEntryFile(
    command.file,
    `${getFileHeader()}

import ${command.input.name ? `{ ${command.input.name} as handle }` : "handle"} from "./${joinPaths(
      relativePath(
        findFilePath(command.file),
        findFilePath(command.input.file)
      ),
      findFileName(command.input.file).replace(
        findFileExtension(command.input.file) || "",
        ""
      )
    )}";
import { StormRequest } from "storm:request";
import { CLIRequestData, colors, renderBanner, renderFooter, parseArgs, showError } from "storm:cli";${
      cmd.children && Object.values(cmd.children).length > 0
        ? Object.values(cmd.children)
            .map(child =>
              child.command.isVirtual
                ? `import handle${pascalCase(
                    child.command.name
                  )}, { renderUsage as render${pascalCase(
                    child.command.name
                  )}Usage } from "./${child.command.name}";`
                : `import { renderUsage as render${pascalCase(
                    child.command.name
                  )}Usage } from "./${child.command.name}/usage";`
            )
            .join("\n")
        : ""
    }

export interface ${request.type.getName()} extends CLIRequestData {
  ${request.args
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
    command.description
      ? `

  \${colors.gray("${command.description}")}
`
      : ""
  }
  \${colors.whiteBright(colors.bold("USAGE:"))}
${
  Object.values(cmd.children).length > 0
    ? Object.values(cmd.children)
        .map(
          child =>
            `\${colors.brand(\`    $ ${kebabCase(cmd.root.bin[0])}${
              child.command.path.length > 0
                ? ` ${child.command.path
                    .filter(Boolean)
                    .map(part => part.replace("[", "<").replace("]", ">"))
                    .join(" ")}`
                : ""
            } [options] \`)}`
        )
        .join("\n")
    : ""
}${
      Object.values(cmd.children).length > 0
        ? `\${mode === "full" ? \`

  \${colors.whiteBright(colors.bold("COMMANDS:"))}
${Object.values(cmd.children)
  .map(
    child =>
      `\${render${pascalCase(
        child.command.name
      )}Usage("minimal").split("\\n").map(line => \`    \${line}\`).join("\\n")}`
  )
  .join("\n\n")}\` : ""}`
        : ""
    }

  \${colors.whiteBright(colors.bold("OPTIONS:"))}
${optionsColumn1
  .map(
    (option, i) =>
      `    \${colors.brand(isLargeConsole ? "${option}".padEnd(${
        LARGE_HELP_COLUMN_WIDTH
      }) : "${option}".padEnd(${column1MaxLength}))}${optionsColumn2[i]}`
  )
  .join(" \n")}
\`;
}

/**
 * The entry point for the ${command.title} virtual command.
 */
async function handler(request: StormRequest<${request.type.getName()}>) {
  ${
    Object.values(cmd.children).length > 0
      ? `if (request.data.args.length > ${command.path.length + 2}) {
    const command = request.data.args[${command.path.length + 1}];
    if (command && !command.startsWith("-")) {
    ${Object.values(cmd.children)
      .map(
        (child, i) =>
          `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.command.name.toLowerCase()}") {
        ${
          child.command.isVirtual
            ? `return handle${pascalCase(child.command.name)}(request);`
            : `const handle = await import("./${child.command.name}").then(m => m.default);
        return handle(request);`
        }
      } `
      )
      .join(" ")}

      showError(\`Unknown command: \${colors.bold(command || "<none>")}\`);
      console.log("");
      console.log(renderUsage("full"));
      console.log(renderFooter());
      console.log("");

      return;
    }
  }`
      : ""
  }

  const args = parseArgs(request.data.args.slice(${command.path.length + 1}), {${
    request.args.filter(arg => arg.type.getKind() === ReflectionKind.boolean)
      .length > 0
      ? `
    boolean: [${request.args
      .filter(arg => arg.name && arg.type.getKind() === ReflectionKind.boolean)
      .map(
        arg =>
          `${arg.name ? `"${arg.name}"` : ""}${
            arg.type.getAlias().length > 0
              ? `, ${arg.type
                  .getAlias()
                  .map(alias => `"${alias}"`)
                  .join(", ")}`
              : ""
          }`
      )
      .join(", ")}],`
      : ""
  }${
    request.args.filter(arg => arg.type.getAlias().length > 0).length > 0
      ? `
    alias: {${request.args
      .map(
        arg =>
          `${camelCase(arg.name)}: [${
            camelCase(arg.name) !== arg.name ? ` "${arg.name}",` : ""
          }${
            camelCase(arg.name) !== pascalCase(arg.name)
              ? ` "${pascalCase(arg.name)}",`
              : ""
          } "${arg.name.toUpperCase()}", ${arg.type
            .getAlias()
            .filter(Boolean)
            .map(
              alias =>
                `"${alias}",${
                  alias !== camelCase(alias) ? ` "${camelCase(alias)}",` : ""
                }${
                  alias !== pascalCase(alias) ? ` "${pascalCase(alias)}",` : ""
                } "${alias.toUpperCase()}"`
            )
            .join(", ")}]`
      )
      .join(",\n ")}},`
      : ""
  }
  });

  if (args["version"] || args["v"]) {
    console.log($storm.env.version);
  } else {
    if (args["no-banner"] !== true && !$storm.env.isMinimal) {
      console.log(renderBanner("${command.title} Commands", "${
        command.description
      }"));
      console.log("");
    }

    console.log(renderUsage("full"));
    console.log(renderFooter());
    console.log("");
  }
}

export default handler;

`
  );
}

async function prepareCommandDefinition(
  log: LogFn,
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  if (cmd.children) {
    for (const subCommand of Object.values(cmd.children)) {
      await prepareCommandDefinition(log, context, subCommand);
    }
  }

  const command = cmd.command;

  log(
    LogLevelLabel.TRACE,
    `Preparing the entry artifact ${command.file} (${
      command?.name ? `export: "${command.name}"` : "default"
    }) from input "${command.input.file}" (${
      command.input.name ? `export: "${command.input.name}"` : "default"
    })`
  );

  if (command.isVirtual) {
    return writeVirtualCommandEntry(log, context, cmd);
  }

  return writeCommandEntry(log, context, cmd);
}

// export async function generateConfigCommands(
//   log: LogFn,
//   context: CLIPluginContext,
//   config: CLIPluginOptions
// ) {
//   if (config.manageConfig === false) {
//     log(
//       LogLevelLabel.TRACE,
//       "Skipping config command generation since `manageConfig` is false."
//     );
//   } else {
//     await Promise.all([
//       context.vfs.writeEntryFile(
//         joinPaths(context.entryPath, "config", "get", "handle.ts"),
//         writeConfigGet(context)
//       ),
//       context.vfs.writeEntryFile(
//         joinPaths(context.entryPath, "config", "set", "handle.ts"),
//         writeConfigSet(context)
//       ),
//       context.vfs.writeEntryFile(
//         joinPaths(context.entryPath, "config", "list", "handle.ts"),
//         writeConfigList(context)
//       ),
//       context.vfs.writeEntryFile(
//         joinPaths(context.entryPath, "config", "delete", "handle.ts"),
//         writeConfigDelete(context)
//       )
//     ]);
//   }
// }

export async function generateCompletionCommands(
  log: LogFn,
  context: CLIPluginContext
) {
  log(LogLevelLabel.TRACE, "Generating completion commands entry points.");

  await Promise.all([
    context.vfs.writeEntryFile(
      joinPaths(context.entryPath, "completions", "bash", "handle.ts"),
      writeCompletionsBash(context, context.options.plugins.cli)
    ),
    context.vfs.writeEntryFile(
      joinPaths(context.entryPath, "completions", "zsh", "handle.ts"),
      writeCompletionsZsh(context, context.options.plugins.cli)
    )
  ]);
}

export async function prepareEntry(
  log: LogFn,
  context: CLIPluginContext,
  commandTree: CommandTree
): Promise<CommandTree> {
  for (const command of Object.values(commandTree.children)) {
    await prepareCommandDefinition(log, context, command);
  }

  let appTitle = titleCase(
    context.options.name ||
      (Array.isArray(context.options.plugins.cli.bin)
        ? context.options.plugins.cli.bin[0]
        : context.options.plugins.cli.bin) ||
      context.packageJson?.name
  )!;
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

  const author = extractAuthor(context);

  await context.vfs.writeEntryFile(
    commandTree.entry.file,
    `#!/usr/bin/env ${
      context.options.mode === "development"
        ? "-S NODE_OPTIONS=--enable-source-maps"
        : ""
    } node

${getFileHeader()}

import { createCLIApp } from "storm:app";
import {
  colors,
  showError,
  showHelp,
  link,
  renderBanner,
  renderFooter,
  parseArgs
} from "storm:cli";
import { isError, isStormError, createStormError } from "storm:error";${
      commandTree.children && Object.values(commandTree.children).length > 0
        ? Object.values(commandTree.children)
            .map(child =>
              child.command.isVirtual
                ? `import handle${pascalCase(
                    child.command.name
                  )}, { renderUsage as render${pascalCase(
                    child.command.name
                  )}Usage } from "./entry/${child.command.path.join("/")}";`
                : `import { renderUsage as render${pascalCase(
                    child.command.name
                  )}Usage } from "./entry/${child.command.path.join(
                    "/"
                  )}/usage";`
            )
            .join("\n")
        : ""
    }

const main = createCLIApp(async (request) => {

  // Exit early if on an older version of Node.js (< ${context.options.plugins.cli.minNodeVersion})
  const major = process.versions.node.split(".").map(Number)[0]!;
  if (major < ${context.options.plugins.cli.minNodeVersion}) {
    showError(\`${titleCase(context.options.name)} CLI requires Node.js version ${context.options.plugins.cli.minNodeVersion} or higher.

You are currently running Node.js v\${process.versions.node}.
Please upgrade Node.js at \${link("https://nodejs.org/en/download/")}\`);
    return;
  }

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
    if ($storm.env.version === latestVersion) {
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
    } ${appTitle} update is available! \${colors.red($storm.env.version)} 🢂 \${colors.green(latestVersion)}\`)}

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
    showError(\`An error occurred while checking for ${
      appTitle
    } application updates: \n\n\${createStormError(err).toString()}\`);
    showHelp("You can disable this update check by setting the \\\`SKIP_UPDATE_CHECK\\\` configuration parameter to true.");
    console.log("");
  }
  `
    : ""
}

  if (request.data.args.includes("--version") || request.data.args.includes("-v")) {
    console.log($storm.env.version);
  } else {
    let command = "";
    if (request.data.args.length > 2 && request.data.args[2]) {
      command = request.data.args[2];
    }

    ${Object.values(commandTree.children)
      .map(
        (child, i) =>
          `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.command.name.toLowerCase()}") {
      ${
        child.command.isVirtual
          ? `return handle${pascalCase(child.command.name)}(request);`
          : `const handle = await import("./entry/${child.command.path.join(
              "/"
            )}").then(m => m.default);
      return handle(request);`
      }
    } `
      )
      .join(" ")} else {
      showError(\`Unknown command: \${colors.bold(command || "<none>")}\`);
      console.log("");
    }

    if (!$storm.env.isMinimal) {
      console.log(renderBanner("Help Information", "Display usage details, commands, and support information for the ${
        appTitle
      } application"));
      console.log("");
    }

    ${
      description
        ? `
    const consoleWidth = Math.max(process.stdout.columns - 2, 80);
    console.log(\`\${" ".repeat((consoleWidth - ${description.length}) / 2)}\${colors.brand("${
      description
    }")}\${" ".repeat((consoleWidth - ${description.length}) / 2)}\`);
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
    console.log(render${pascalCase(child.command.name)}Usage("minimal"));`
            )
            .join("\n")
        : ""
    }

    console.log(renderFooter());
    console.log("");
  }
});

${context.options.esbuild.format === "cjs" ? "void" : "await"} main({ args: process.argv });

`
  );

  return commandTree;
}

export async function addCommandArgReflections(
  context: CLIPluginContext,
  cmd: CommandTreeBranch
) {
  const request = cmd.command.request;
  if (!request) {
    throw new Error(`Command ${cmd.command.id}'s request is missing`);
  }

  for (const arg of request.args) {
    let name = constantCase(arg.name);
    if (name) {
      const aliasProperties = context.reflections.config.params
        ?.getProperties()
        .filter(prop => prop.getAlias().length > 0);

      const prefix = context.options.plugins.config.prefix.find(
        pre =>
          name &&
          name.startsWith(pre) &&
          (context.reflections.config.params?.hasProperty(
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
        !context.reflections.config.params?.hasProperty(name) &&
        !aliasProperties?.some(prop => prop.getAlias().includes(name))
      ) {
        context.reflections.config.params?.addProperty({
          name,
          optional: true,
          description: arg.type.getDescription(),
          type: arg.type.getType(),
          default: arg.type.getDefaultValue(),
          tags: {
            domain: "cli",
            alias:
              arg.type.getAlias().filter(alias => alias && alias.length > 1)
                .length > 0
                ? arg.type
                    .getAlias()
                    .filter(alias => alias && alias.length > 1)
                    .map(alias => constantCase(alias))
                : undefined
          }
        });
      }
    }
  }

  if (cmd.children) {
    for (const subCommand of Object.values(cmd.children)) {
      await addCommandArgReflections(context, subCommand);
    }
  }
}
