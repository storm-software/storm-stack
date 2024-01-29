import chalk from "chalk";
import terminalLink from "terminal-link";

/**
 * Create a link to a URL in the terminal.
 *
 * @param url - The URL to link to.
 * @returns A terminal link
 */
export function link(url: string): string {
  return terminalLink(url, url, {
    fallback: (url) => chalk.underline(url)
  });
}
