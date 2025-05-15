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
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { Context, Options } from "@storm-stack/core/types/build";
import type { LogFn } from "@storm-stack/core/types/config";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { constantCase } from "@stryke/string-format/constant-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { writePrompt } from "../runtime/prompt";
import { writeStorage } from "../runtime/storage";
import type { StormStackCLIPresetConfig } from "../types/config";
import type { CommandReflection } from "../types/reflection";
import { reflectCommands } from "./reflect-command";

export async function prepareRuntime<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
) {
  const runtimeDir = joinPaths(
    context.options.projectRoot,
    context.artifactsDir,
    "runtime"
  );

  log(LogLevelLabel.TRACE, `Preparing the runtime files in "${runtimeDir}"`);

  await Promise.all([
    writeFile(log, joinPaths(runtimeDir, "storage.ts"), writeStorage()),
    writeFile(log, joinPaths(runtimeDir, "prompt.ts"), writePrompt())
  ]);
}

export async function prepareEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  const commands = await reflectCommands(log, context);

  const varsReflection = await resolveDotenvReflection(context, "variables");
  await Promise.all(
    Object.values(commands).map(async command => {
      log(
        LogLevelLabel.TRACE,
        `Reflecting command arguments for "${command.name}"`
      );
      await addCommandArgReflections(varsReflection, command);
    })
  );

  await Promise.all(
    Object.values(commands).map(async command =>
      prepareCommandDefinition(log, context, command)
    )
  );

  const name = context.options.name ?? config.bin;
  const displayName = titleCase(name);

  await Promise.all(
    context.entry.map(async entry =>
      writeFile(
        log,
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
} from "@stryke/cli/utils/align-text";
 import { box } from "@stryke/cli/utils/box";
import { colors } from "@stryke/cli/utils/color";
import { registerShutdown } from "@stryke/cli/shutdown";
import { renderUsage } from "@stryke/cli/usage";
import { tryGetWorkspaceConfig } from "@stryke/cli/usage";
import { isStormError } from "./runtime/error";

const shutdown = await registerShutdown();

try {
  const rawArgs = process.argv.slice(2);
  const command = await resolveCommand(
    {
      meta: {
        name: "${name}",
        displayName: "${displayName}",
        version: $storm.vars.APP_VERSION,
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

    console.log(
      box(\`\${renderedTitle}\\n\\n\${renderedDescription}\\n\\n\${renderedUrls}\`, {
        title: ${context.workspaceConfig?.organization ? `"${titleCase(context.workspaceConfig.organization)}"` : "undefined"},
        style: {
          padding: 1
        }
      })
    );
    console.log(\`\\n\\n\${renderLicense(meta)}\\n\\n\`);
  }

  if (
    rawArgs.includes("--help") ||
    rawArgs.includes("-h") ||
    rawArgs.includes("-?")
  ) {
    console.log(\`\${await renderUsage(command)}\\n\\n\`);
    console.log(\`\${await renderLicense(meta)}\\n\\n\`);
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

    console.log(meta.version);
  } else {
    await runCommand(command, { rawArgs });
  }
} catch (error) {
  console.error(error, "An unexpected error occurred");
  await shutdown(isStormError(error) ? error.code : 1);
}

`
      )
    )
  );
}

async function prepareCommandDefinition<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  command: CommandReflection
) {
  if (command.subCommands) {
    await Promise.all(
      Object.values(command.subCommands).map(async subCommand =>
        prepareCommandDefinition(log, context, subCommand)
      )
    );
  }

  log(
    LogLevelLabel.TRACE,
    `Preparing the entry artifact ${command.entry.file} (${command.entry?.name ? `export: "${command.entry.name}"` : "default"})" from input "${command.entry.input.file}" (${command.entry.input.name ? `export: "${command.entry.input.name}"` : "default"})`
  );

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
import { wrap } from "./runtime/app";
import { storage } from "./runtime/storage";
import { StormRequest } from "./runtime/request";
import { StormResponse } from "./runtime/response";
import { getAppVersion } from "./runtime/context";${
      command.subCommands && Object.keys(command.subCommands).length > 0
        ? Object.keys(command.subCommands)
            .map(key => `import ${key} from "./${key}";`)
            .join("\n")
        : ""
    }
import { defineCommand } from "@stryke/cli/define-command";
import type { CommandContext } from "@stryke/cli/types";
import { deserialize, serialize } from "@deepkit/type";
import { ${command.argsTypeName} } from "${relativePath(
      findFilePath(command.entry.file),
      joinPaths(context.workspaceConfig.workspaceRoot, command.argsTypeImport)
    )}";

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
  handle: wrap<
    StormRequest<${command.argsTypeName}>,
    StormResponse<any>,
    CommandContext<any>,
    any
  >(
    handle,
    {
      deserializer: (payload: any) => new StormRequest(
        deserialize<${command.argsTypeName}>(payload.args)
      ),
      serializer: (result: any) => new StormResponse(result)
    }
  )
})

`
  );
}

async function addCommandArgReflections(
  reflection: ReflectionClass<any>,
  command: CommandReflection
) {
  command.args.forEach(arg => {
    if (!reflection.hasProperty(constantCase(arg.name))) {
      reflection.addProperty({
        name: constantCase(arg.name),
        optional: true,
        description: arg.description,
        type: deserializeType(arg.reflectionType)
      });
    }
  });

  if (command.subCommands) {
    await Promise.all(
      Object.values(command.subCommands).map(async subCommand =>
        addCommandArgReflections(reflection, subCommand)
      )
    );
  }
}
