import type { StormConfig } from "@storm-software/config";
import { createStormConfig } from "@storm-software/config-tools";
import { getCauseFromUnknown } from "@storm-stack/errors";
import { StormLog } from "@storm-stack/logging";
import { EMPTY_STRING, NEWLINE_STRING, titleCase } from "@storm-stack/utilities";
import chalk from "chalk";
import { Argument, Command, Option } from "commander";
import { Table } from "console-table-printer";
import { text } from "figlet";
import type { CLIArgument, CLICommand, CLIConfig, CLIOption } from "../types";
import { registerShutdown } from "./shutdown";

const createCLIArgument = (cliArgument: CLIArgument): Argument => {
  const argument = new Argument(cliArgument.flags, cliArgument.description ?? EMPTY_STRING);
  if (cliArgument.default) {
    argument.default;
  }

  return argument;
};

const createCLIOption = (cliOption: CLIOption): Option => {
  const option = new Option(cliOption.flags, cliOption.description ?? EMPTY_STRING);
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

export async function createCLIProgram(cliConfig: CLIConfig): Promise<void> {
  const config: StormConfig = createStormConfig();
  const logger = StormLog.create(config);

  try {
    if (cliConfig.banner?.hide !== true) {
      text(
        cliConfig.banner?.name ?? cliConfig.name ?? config.name ?? "Storm CLI",
        cliConfig.banner?.options ?? {
          font: cliConfig.banner?.font ?? "Larry 3D"
        },
        (err, data) => {
          if (err) {
            return;
          }

          console.log(chalk.hex(config.colors.primary)(data));
        }
      );

      if (cliConfig.by?.hide !== true) {
        text(
          `by ${cliConfig.by?.name ?? config.organization ?? "Storm"}`,
          cliConfig.banner?.options ?? { font: cliConfig.by?.font ?? "Doom" },
          (err, data) => {
            if (err) {
              return;
            }

            console.log(chalk.hex(config.colors.primary)(data));
          }
        );
      }
    }

    logger.info(`⚡ Starting the ${titleCase(cliConfig.name) ?? "Storm CLI"} application`);

    const urlDisplay = `\nWebsite: ${cliConfig.homepageUrl ?? config.homepage} \nDocumentation: ${
      cliConfig.documentationUrl ?? config.homepage.endsWith("/")
        ? `${config.homepage}docs`
        : `${config.homepage}/docs`
    } \nRepository: ${cliConfig.repositoryUrl ?? config.repository} \n`;
    const licenseDisplay = `\n This software is distributed under the ${
      cliConfig.license ?? config.license
    } license. \nFor more information, please visit ${
      cliConfig.licenseUrl ?? cliConfig.documentationUrl ?? config.homepage.endsWith("/")
        ? `${config.homepage}license`
        : `${config.homepage}/license`
    } \n`;

    logger.debug(urlDisplay);
    logger.info(licenseDisplay);

    logger.start(titleCase(cliConfig.name) ?? "Storm CLI Application");
    const program = new Command(cliConfig.name ?? "Storm CLI");
    const shutdown = registerShutdown({
      logger,
      onShutdown: () => {
        logger.stopwatch("Storm CLI Application");
        program.exitOverride();

        logger.info("Application is shutting down...");
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
                    left: chalk.hex(config.colors.background)("╔"),
                    mid: chalk.hex(config.colors.background)("╦"),
                    right: chalk.hex(config.colors.background)("╗"),
                    other: chalk.hex(config.colors.background)("═")
                  },
                  headerBottom: {
                    left: chalk.hex(config.colors.background)("╟"),
                    mid: chalk.hex(config.colors.background)("╬"),
                    right: chalk.hex(config.colors.background)("╢"),
                    other: chalk.hex(config.colors.background)("═")
                  },
                  tableBottom: {
                    left: chalk.hex(config.colors.background)("╚"),
                    mid: chalk.hex(config.colors.background)("╩"),
                    right: chalk.hex(config.colors.background)("╝"),
                    other: chalk.hex(config.colors.background)("═")
                  },
                  vertical: chalk.hex(config.colors.background)("║")
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
                    { color: config.colors.primary }
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
      logger.fatal(innerError);
      shutdown(getCauseFromUnknown(innerError).message);
    }
  } catch (error) {
    logger.fatal(error);
    process.exit(1);
  }
}
