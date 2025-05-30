/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import { colors } from "../../../runtime/cli";

/**
 * Renders the Add - Page command usage information.
 *
 * @param includeCommands - Whether to include rendering sub-commands.
 * @returns The rendered string displaying usage information.
 */
export function renderUsage(includeCommands = true) {
  return `${colors.whiteBright(colors.bold("Add - Page"))}

  ${colors.gray("Add a page to the file system.")}

  ${colors.whiteBright(colors.bold("Usage:"))}
    examples-cli add page [options] 

  ${colors.whiteBright(colors.bold("Options:"))}
    --help, -h, -?                   ${colors.gray("Show help information. [default: false]")} 
    --version, -v                    ${colors.gray("Show the version of the application. [default: false]")} 
    --interactive, -i, --interact    ${colors.gray("Enable interactive mode (will be set to false if running in a CI pipeline). [default: true]")} 
    --no-interactive, --no-interact  ${colors.gray("Disable interactive mode (will be set to true if running in a CI pipeline). [default: false]")} 
    --no-banner                      ${colors.gray("Hide the banner displayed while running the CLI application (will be set to true if running in a CI pipeline). [default: false]")} 
    --verbose, -v                    ${colors.gray("Enable verbose output. [default: false]")} 
    --file <file>, -f <file>         ${colors.gray('The file to add to the file system. [default: "page.ts"]')}
`;
}
