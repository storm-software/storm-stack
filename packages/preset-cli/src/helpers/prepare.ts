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
import { isSetString } from "@stryke/type-checks/is-set-string";
import { writeApp } from "../runtime/app";
import { writeRuntime } from "../runtime/cli";
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
  const description =
    !command.description?.endsWith(".") && !command.description?.endsWith("?")
      ? `${command.description}.`
      : command.description;

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
import { colors, renderBanner, renderFooter${config.interactive !== "never" ? ", prompt" : ""} } from "${joinPaths(runtimeRelativePath, "cli")}";${
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

\${colors.dim("${description}")}
`
      : ""
  }
  \${colors.bold("Usage:")}
    ${kebabCase(binName)}${
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
      `    ${kebabCase(binName)}${
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
        ? `if (process.argv.length > ${command.entry.path.length + 2}) {
      const command = process.argv[${command.entry.path.length + 1}];
      if (command && !command.startsWith("-")) {
      ${Object.values(command.children)
        .map(
          (child, i) =>
            `${i === 0 ? "if" : "else if"} (command.toLowerCase() === "${child.name.toLowerCase()}") {
          return handle${pascalCase(child.name)}();
    } `
        )
        .join(" ")}

        console.error(\` \${colors.red("✖")} \${colors.redBright(\`Unknown command: \${colors.bold(command || "")}\`)}\`);
        console.log("");
        console.log(renderUsage(true));
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
        console.log(renderBanner("${command.displayName}", "${description}"));
        console.log("");
      }

      if (args["help"] || args["h"] || args["?"]) {
        console.log(renderUsage(true));
        console.log("");
        console.log(renderFooter());
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
   console.error(\` \${colors.red("✖")} \${colors.redBright(\`Error occurred while processing ${command.displayName} command.\`)}\`);
  }
}

export default handler;

`
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
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime"
    )
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
    Math.max(...optionsColumn1.map(option => option.length)) + 2;

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
import { getRuntimeInfo } from "${joinPaths(runtimeRelativePath, "env")}";
import { colors, renderBanner, renderFooter } from "${joinPaths(runtimeRelativePath, "cli")}";${
      command.children && Object.values(command.children).length > 0
        ? Object.values(command.children)
            .map(
              child =>
                `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(child.name)}Usage } from "./${child.name}";`
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
 * @param includeCommands - Whether to include rendering sub-commands.
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(includeCommands = true) {
  return \`\${colors.bold("${command.displayName} Commands")} ${
    command.description
      ? `

\${colors.dim("${description}")}
`
      : ""
  }
  \${colors.bold("Usage:")}
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
        ? `\${includeCommands !== false ? \`
  \${colors.bold("Commands:")}
${Object.values(command.children)
  .map(
    child =>
      `\${render${pascalCase(child.name)}Usage(false).split("\\n").map(line => \`    \${line}\`).join("\\n")}`
  )
  .join("\n\n")}\` : ""}`
        : ""
    }

  \${colors.bold("Options:")}
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
          return handle${pascalCase(child.name)}();
    } `
        )
        .join(" ")}

        console.error(\` \${colors.red("✖")} \${colors.redBright(\`Unknown command: \${colors.bold(command || "")}\`)}\`);
        console.log("");
        console.log(renderUsage(true));
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
      const runtimeInfo = getRuntimeInfo();
      if (args["no-banner"] !== true && !runtimeInfo.isCI) {
        console.log(renderBanner("${command.displayName} Commands", "${description}"));
        console.log("");
      }

      console.log(renderUsage(true));
      console.log("");
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
   console.error(\` \${colors.red("✖")} \${colors.redBright(\`Error occurred while processing ${
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
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot,
          context.artifactsDir,
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
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot,
          context.artifactsDir,
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
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot,
          context.artifactsDir,
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
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot,
          context.artifactsDir,
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

export async function prepareRuntime<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
) {
  await Promise.all([
    writeFile(
      log,
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.options.projectRoot,
        context.artifactsDir,
        "runtime",
        "app.ts"
      ),
      writeApp(context, config)
    ),
    writeFile(
      log,
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.options.projectRoot,
        context.artifactsDir,
        "runtime",
        "cli.ts"
      ),
      writeRuntime(context, config)
    ),
    generateVarsCommands(log, context, config)
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

  await writeFile(
    log,
    commandTree.entry.file,
    `#!/usr/bin/env node

${getFileHeader()}

import { colors, renderBanner, renderFooter } from "./runtime/cli";
import { getRuntimeInfo } from "./runtime/env";
import { isError } from "@stryke/type-checks/is-error";${
      commandTree.children && Object.values(commandTree.children).length > 0
        ? Object.values(commandTree.children)
            .map(
              child =>
                `import handle${pascalCase(child.name)}, { renderUsage as render${pascalCase(
                  child.name
                )}Usage } from "./commands/${child.entry.path.join("/")}";`
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
        console.error(\` \${colors.red("✖")} \${colors.redBright(\`Unknown command: \${colors.bold(command || "")}\`)}\`);
      }

      const runtimeInfo = getRuntimeInfo();
      if (!runtimeInfo.isCI) {
        console.log(renderBanner("Help Information", "Display usage details, commands, and support information for the ${context.options.name} application"));
        console.log("");
      }

      console.log("");${
        context.packageJson?.description
          ? `
      console.log("${context.packageJson?.description}");
      console.log("");`
          : ""
      }
      console.log("The following commands are available as part of the ${context.options.name} application: ");
      console.log("");
      ${
        commandTree.children && Object.values(commandTree.children).length > 0
          ? Object.values(commandTree.children)
              .map(
                child =>
                  `console.log(render${pascalCase(child.name)}Usage(false).split("\\n").map(line => \`  \${line}\`).join("\\n"));`
              )
              .join("\n")
          : ""
      }
      console.log("");
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
    if (isError(err)) {
      console.error(colors.red(\` \${colors.red("✖")} \${colors.redBright(\`An error occurred while running the ${context.options.name} application: \${err.message}\`)}\`));
    } else {
      console.error(colors.red(\` \${colors.red("✖")} \${colors.redBright(\`An error occurred while running the ${context.options.name} application\`)}\`));
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
  const link: (typeof import("${relativeCLIRuntimeDir}"))["link"];
  const renderBanner: (typeof import("${relativeCLIRuntimeDir}"))["renderBanner"];${
    config.interactive !== "never"
      ? `
  const prompt: (typeof import("${relativeCLIRuntimeDir}"))["prompt"];`
      : ""
  }

  export {${config.interactive !== "never" ? " prompt," : ""} parseArgs, colors, getColor, link, renderBanner };
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
