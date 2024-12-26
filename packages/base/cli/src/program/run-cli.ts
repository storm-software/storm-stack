/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import type { StormConfig } from "@storm-software/config";
import { createStormConfig } from "@storm-software/config-tools";
import { writeBanner } from "@storm-stack/cli-helpers/terminal/write-banner";
import type {
  CLIArgument,
  CLICommand,
  CLIConfig,
  CLIOption
} from "@storm-stack/cli-helpers/types";
import { StormError } from "@storm-stack/errors";
import { StormLog } from "@storm-stack/logging";
import { titleCase } from "@storm-stack/string-fns/title-case";
import {
  EMPTY_STRING,
  NEWLINE_STRING
} from "@storm-stack/types/utility-types/base";
import chalk from "chalk";
import { Argument, Command, Option } from "commander";
import { Table } from "console-table-printer";
import { registerShutdown } from "./shutdown";

const createCLIArgument = (cliArgument: CLIArgument): Argument => {
  const argument = new Argument(
    cliArgument.flags,
    cliArgument.description ?? EMPTY_STRING
  );
  if (cliArgument.default) {
    argument.default;
  }

  return argument;
};

const createCLIOption = (cliOption: CLIOption): Option => {
  const option = new Option(
    cliOption.flags,
    cliOption.description ?? EMPTY_STRING
  );
  if (cliOption.choices) {
    option.choices(cliOption.choices);
  }
  if (cliOption.default) {
    option.default(cliOption.default.value, cliOption.default.description);
  }

  return option;
};

const createCLICommand = (cliCommand: CLICommand): Command => {
  const command = new Command(cliCommand.name);
  command.description(cliCommand.description ?? EMPTY_STRING);
  if (cliCommand.commands) {
    for (const _cliCommand of cliCommand.commands) {
      command.addCommand(createCLICommand(_cliCommand));
    }
  }
  if (cliCommand.options) {
    for (const _cliOption of cliCommand.options) {
      command.addOption(createCLIOption(_cliOption));
    }
  }
  if (cliCommand.argument) {
    for (const _cliArgument of cliCommand.argument) {
      command.addArgument(createCLIArgument(_cliArgument));
    }
  }

  command.action(cliCommand.action);
  return command;
};

/**
 * Run a CLI program with the given configuration
 *
 * @param cliConfig - The configuration for the CLI program
 */
export async function runCLI(cliConfig: CLIConfig): Promise<void> {
  const config: StormConfig = createStormConfig();

  const name = cliConfig.name ?? config.name ?? "Storm CLI";

  StormLog.initialize(name, config);
  StormLog.info(config);

  try {
    writeBanner(
      {
        name,
        ...cliConfig.banner
      },
      {
        name: config.organization,
        ...cliConfig.by
      }
    );

    StormLog.info(
      `⚡ Starting the ${titleCase(cliConfig.name) ?? "Storm CLI"} application`
    );

    const urlDisplay = `\nWebsite: ${cliConfig.homepageUrl ?? config.homepage} \nDocumentation: ${
      (cliConfig.documentationUrl ?? config.homepage.endsWith("/"))
        ? `${config.homepage}docs`
        : `${config.homepage}/docs`
    } \nRepository: ${cliConfig.repositoryUrl ?? config.repository} \n`;
    const licenseDisplay = `\n This software is distributed under the ${
      cliConfig.license ?? config.license
    } license. \nFor more information, please visit ${
      (cliConfig.licenseUrl ??
      cliConfig.documentationUrl ??
      config.homepage.endsWith("/"))
        ? `${config.homepage}license`
        : `${config.homepage}/license`
    } \n`;

    StormLog.debug(urlDisplay);
    StormLog.info(licenseDisplay);

    const startDateTime = StormLog.start(titleCase(cliConfig.name ?? name));
    const program = new Command(cliConfig.name ?? "Storm CLI");
    const shutdown = registerShutdown({
      onShutdown: () => {
        StormLog.stopwatch(startDateTime, titleCase(cliConfig.name ?? name));
        program.exitOverride();

        StormLog.info("Application is shutting down...");
      }
    });

    try {
      program.hook("preAction", cliConfig.preAction);
      program.hook("postAction", cliConfig.postAction);

      program.version("v1.0.0", "-v --version", "display CLI version");
      program
        .description(`⚡ ${cliConfig.description}`)
        .showHelpAfterError()
        .showSuggestionAfterError();

      for (const command of cliConfig.commands) {
        program.addCommand(createCLICommand(command));
      }

      program
        .addHelpCommand("help [cmd]", "Display help for [cmd]")
        .addHelpText(
          "beforeAll",
          `Welcome to the ${titleCase(cliConfig.name) ?? "Storm CLI"} application! \n${
            cliConfig.description
          } \n${urlDisplay} \n${licenseDisplay}`
        )
        .addHelpText(
          "afterAll",
          `For more information, please visit <${cliConfig.homepageUrl ?? config.homepage}>`
        )
        .addHelpText("before", () => {
          return cliConfig.commands
            .map((command: CLICommand) => {
              const table = new Table({
                style: {
                  headerTop: {
                    left: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╔"),
                    mid: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╦"),
                    right: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╗"),
                    other: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("═")
                  },
                  headerBottom: {
                    left: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╟"),
                    mid: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╬"),
                    right: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╢"),
                    other: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("═")
                  },
                  tableBottom: {
                    left: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╚"),
                    mid: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╩"),
                    right: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("╝"),
                    other: chalk.hex(
                      (config.colors as any)?.dark?.background ?? "#FFFFFF"
                    )("═")
                  },
                  vertical: chalk.hex(
                    (config.colors as any)?.dark?.background ?? "#FFFFFF"
                  )("║")
                },
                title: command.name,
                columns: [
                  { name: "flags", title: "Flags", alignment: "left" },
                  {
                    name: "description",
                    title: "Description",
                    alignment: "left"
                  },
                  { name: "options", title: "Options", alignment: "left" },
                  {
                    name: "defaultValue",
                    title: "Default Value",
                    alignment: "left"
                  }
                ]
              });

              // add rows with color
              if (command.options) {
                for (const option of command.options) {
                  table.addRow(
                    {
                      flags: option.flags,
                      description: option.description ?? EMPTY_STRING,
                      options: option.choices?.join(", ") ?? EMPTY_STRING,
                      defaultValue: option.default?.value ?? EMPTY_STRING
                    },
                    {
                      color: (config.colors as any)?.dark?.primary ?? "#FFFFFF"
                    }
                  );
                }
              }

              return table.render();
            })
            .join(NEWLINE_STRING + NEWLINE_STRING + NEWLINE_STRING);
        });

      await program.parseAsync(process.argv);
      shutdown();
    } catch (innerError) {
      StormLog.fatal(innerError);
      shutdown(StormError.create(innerError).message);
    }
  } catch (error) {
    StormLog.fatal(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}
