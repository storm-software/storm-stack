#!/usr/bin/env node

/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import { renderUsage as renderAddUsage } from "./commands/add/usage";
import { renderUsage as renderServeUsage } from "./commands/serve/usage";
import handleVars, { renderUsage as renderVarsUsage } from "./commands/vars";
import { colors, renderBanner, renderFooter } from "./runtime/cli";
import { isMinimal } from "./runtime/env";

async function main() {
  try {
    if (process.argv.includes("--version") || process.argv.includes("-v")) {
      console.log($storm.vars.APP_VERSION);
    } else {
      let command = "";
      if (process.argv.length > 2 && process.argv[2]) {
        command = process.argv[2];
      }

      if (command.toLowerCase() === "vars") {
        return handleVars();
      } else if (command.toLowerCase() === "serve") {
        const handle = await import("./commands/serve").then(m => m.default);
        return handle();
      } else if (command.toLowerCase() === "add") {
        const handle = await import("./commands/add").then(m => m.default);
        return handle();
      } else {
        console.error(
          ` ${colors.red("✘")} ${colors.redBright(`Unknown command: ${colors.bold(command || "<none>")}`)}`
        );
        console.log("");
      }

      if (!isMinimal) {
        console.log(
          renderBanner(
            "Help Information",
            "Display usage details, commands, and support information for the examples-cli-app application"
          )
        );
        console.log("");
      }

      const consoleWidth = Math.max(process.stdout.columns - 2, 80);
      console.log(
        `${" ".repeat((consoleWidth - 46) / 2)}An example Storm Stack commandline application${" ".repeat((consoleWidth - 46) / 2)}`
      );
      console.log("");
      console.log("");
      console.log(
        colors.gray(
          "The following commands are available as part of the examples-cli-app application: "
        )
      );
      console.log("");
      console.log(renderVarsUsage(false));
      console.log("");

      console.log(renderServeUsage(false));
      console.log("");

      console.log(renderAddUsage(false));
      console.log("");

      console.log("");
      console.log(renderFooter());
      console.log("");
    }
  } catch (err) {
    console.error(
      ` ${colors.red("✘")} ${colors.redBright(`An error occurred while running the examples-cli-app application: 

${createStormError(err).toDisplay()}`)}`
    );
  }
}

await main();
