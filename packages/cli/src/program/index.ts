import { createStormConfig } from "@storm-software/config-tools";
import { getCauseFromUnknown } from "@storm-stack/errors/storm-error";
import { StormLog } from "@storm-stack/logging";
import { EMPTY_STRING, NEWLINE_STRING } from "@storm-stack/utilities";
import chalk from "chalk";
import { AddHelpTextContext, Argument, Command, Option } from "commander";
import { Table } from "console-table-printer";
import { CLIArgument, CLICommand, CLIConfig, CLIOption } from "../types";
import { registerShutdown } from "./shutdown";

const createCLICommand = (cliCommand: CLICommand): Command => {
  const command = new Command(cliCommand.name);
  command.description(cliCommand.description ?? EMPTY_STRING);
  if (cliCommand.commands) {
    cliCommand.commands.forEach(_cliCommand =>
      command.addCommand(createCLICommand(_cliCommand))
    );
  }
  if (cliCommand.options) {
    cliCommand.options.forEach(_cliOption =>
      command.addOption(createCLIOption(_cliOption))
    );
  }
  if (cliCommand.argument) {
    cliCommand.argument.forEach(_cliArgument =>
      command.addArgument(createCLIArgument(_cliArgument))
    );
  }

  command.action(cliCommand.action);
  return command;
};

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

export const createCLIProgram = async (cliConfig: CLIConfig): Promise<void> => {
  const config = createStormConfig();
  const logger = StormLog.create(config);

  try {
    logger.info(`Starting ${cliConfig.name ?? "Storm CLI Application"}`);
    logger.start(cliConfig.name ?? "Storm CLI Application");

    const program = new Command(cliConfig.name ?? "Storm CLI Application");
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
        .description(`${chalk.bold.blue("⚡")} ${cliConfig.description}`)
        .showHelpAfterError()
        .showSuggestionAfterError();

      cliConfig.commands.forEach(command => {
        program.addCommand(createCLICommand(command));
      });

      program
        .addHelpCommand("help [cmd]", "display help for [cmd]")
        .addHelpText("beforeAll", "Welcome to Storm CLI Application!")
        .addHelpText(
          "afterAll",
          "For more information, please visit <https://storm-software.org>"
        )
        .addHelpText("before", (context: AddHelpTextContext) => {
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
              command.options?.forEach(option => {
                table.addRow(
                  {
                    flags: option.flags,
                    description: option.description ?? EMPTY_STRING,
                    options: option.choices?.join(", ") ?? EMPTY_STRING,
                    defaultValue: option.default?.value ?? EMPTY_STRING
                  },
                  { color: config.colors.primary }
                );
              });

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
};
