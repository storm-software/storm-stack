/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import { colors } from "../../runtime/cli";

/**
 * Renders the Add command usage information.
 *
 * @param includeCommands - Whether to include rendering sub-commands.
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(includeCommands = true) {
  return `${colors.bold("Add")}

${colors.dim("Add an item to the file system.")}

  ${colors.bold("Usage:")}
    examples-cli add [options] 
    examples-cli add page [options]${
      includeCommands !== false
        ? `
  ${colors.bold("Commands:")}
    Add - Page (page)                ${colors.dim("Add a page to the file system.")}`
        : ""
    }

  ${colors.bold("Options:")}
    --help, -h, -?                   ${colors.dim("Show help information. [default: false]")} 
    --version, -v                    ${colors.dim("Show the version of the application. [default: false]")} 
    --interactive, -i, --interact    ${colors.dim("Enable interactive mode (will be set to false if running in a CI pipeline). [default: true]")} 
    --no-interactive, --no-interact  ${colors.dim("Disable interactive mode (will be set to true if running in a CI pipeline). [default: false]")} 
    --no-banner                      ${colors.dim("Hide the banner displayed while running the CLI application (will be set to true if running in a CI pipeline). [default: false]")} 
    --verbose, -v                    ${colors.dim("Enable verbose output. [default: false]")} 
    --file <file>, -f <file>         ${colors.dim('The file to add to the file system. [default: "server.ts"]')} 
    --type <type>, -t <type>         ${colors.dim('The type of the file. [default: "server"]')}
`;
}
