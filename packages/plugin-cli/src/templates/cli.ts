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

import { getGradient } from "@storm-software/config-tools/utilities/colors";
import { getFileHeader } from "@storm-stack/core/lib";
import { stripAnsi } from "@stryke/cli/utils/strip-ansi";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { render } from "cfonts";
import { defu } from "defu";
import { renderUnicodeCompact } from "uqr";
import { getStyles } from "../helpers/ansi-utils";
import {
  LARGE_CONSOLE_WIDTH,
  LARGE_HELP_COLUMN_WIDTH,
  MAX_BANNER_WIDTH,
  MAX_MESSAGE_WIDTH,
  MIN_BANNER_WIDTH,
  MIN_CONSOLE_WIDTH,
  MIN_MESSAGE_WIDTH
} from "../helpers/constants";
import { extractAuthor } from "../helpers/utilities";
import type { CFontResultObject, CLIPluginContext } from "../types/config";

export function CLIModule(context: CLIPluginContext) {
  let appTitle = titleCase(
    context.options.name ||
      (Array.isArray(context.options.plugins.cli.bin)
        ? context.options.plugins.cli.bin[0]
        : context.options.plugins.cli.bin) ||
      context.packageJson?.name
  );
  if (!appTitle) {
    throw new Error(
      "No application name provided in the Storm Stack configuration."
    );
  }

  context.options.plugins.cli.title ??= appTitle;
  if (!appTitle.toLowerCase().endsWith("cli")) {
    appTitle += " CLI";
  }

  const author = extractAuthor(context);
  if (author?.name) {
    author.name = titleCase(author.name);
  }

  let homepage = context.options.homepage;
  if (!homepage) {
    if (context.packageJson?.homepage) {
      homepage = context.packageJson.homepage;
    } else if (
      isObject(context.packageJson?.author) &&
      context.packageJson?.author?.url
    ) {
      homepage = context.packageJson.author.url;
    } else if (
      context.packageJson?.contributors &&
      context.packageJson.contributors.length > 0 &&
      isObject(context.packageJson.contributors[0]) &&
      context.packageJson.contributors[0]?.url
    ) {
      homepage = context.packageJson.contributors[0]?.url;
    }
  }

  let support = context.options.support;
  if (!support) {
    if (isObject(context.packageJson?.bugs) && context.packageJson?.bugs?.url) {
      support = context.packageJson.bugs.url;
    }
  }

  let contact = context.options.contact;
  if (!contact) {
    if (
      isObject(context.packageJson?.author) &&
      context.packageJson?.author?.url
    ) {
      contact = context.packageJson.author.url;
    } else if (
      context.packageJson?.contributors &&
      context.packageJson.contributors.length > 0 &&
      isObject(context.packageJson.contributors[0]) &&
      context.packageJson.contributors[0]?.url
    ) {
      contact = context.packageJson.contributors[0]?.url;
    }
  }

  let docs = context.options.docs;
  if (!docs) {
    if (context.packageJson?.docs) {
      docs = context.packageJson.docs;
    }
  }

  let repository = context.options.repository;
  if (!repository) {
    if (context.packageJson?.repository) {
      repository = isString(context.packageJson.repository)
        ? context.packageJson.repository
        : context.packageJson.repository?.url;
    }
  }

  const footerHeader = author?.name
    ? `${appTitle} is authored and maintained by ${author.name}.`
    : "";
  const footerHeaderLength = stripAnsi(footerHeader).length;

  const linksColumn1 = [] as string[];
  const linksColumn2 = [] as string[];
  if (homepage) {
    linksColumn1.push("Homepage:");
    linksColumn2.push(homepage);
  }
  if (support) {
    linksColumn1.push("Support:");
    linksColumn2.push(support);
  }
  if (contact && contact !== homepage && contact !== support) {
    linksColumn1.push("Contact:");
    linksColumn2.push(contact);
  }
  if (docs) {
    linksColumn1.push("Documentation:");
    linksColumn2.push(docs);
  }
  if (repository) {
    linksColumn1.push("Repository:");
    linksColumn2.push(repository);
  }

  const linksMaxLength = Math.max(...linksColumn1.map(line => line.length)) + 8;

  if (!(author?.url || homepage || docs || support || contact || repository)) {
    throw new Error(
      "No homepage, support, contact, documentation or repository URL provided in the Storm Stack configuration."
    );
  }

  let bannerTitle: string | undefined;
  if (context.options.plugins.cli.title) {
    const gradient = getGradient(
      context.options.plugins.cli.colors as Parameters<typeof getGradient>[0]
    );

    const result = render(
      isSetString(context.options.plugins.cli.title)
        ? titleCase(context.options.plugins.cli.title)
        : context.options.plugins.cli.title.text
          ? titleCase(context.options.plugins.cli.title.text)
          : titleCase(context.options.name),
      defu(
        isSetObject(context.options.plugins.cli.title)
          ? context.options.plugins.cli.title
          : {},
        {
          font: "tiny",
          colors: [context.options.plugins.cli.colors.brand],
          gradient: gradient && gradient.length > 0 ? gradient : undefined,
          independentGradient: false,
          transitionGradient: gradient && gradient.length > 0,
          rawMode: false,
          env: "node"
        }
      )
    ) as CFontResultObject | boolean;
    if (isSetObject(result) && result.string) {
      bannerTitle = result.string;
    }
  }

  const bannerTitleMaxLength = bannerTitle
    ? Math.max(
        ...bannerTitle
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => stripAnsi(line).length)
      )
    : 0;

  const styles = getStyles(context);

  return `
/**
 * The CLI module provides a unified command-line interface for the Storm Stack runtime.
 *
 * @module storm:cli
 */

${getFileHeader()}

import { StormError, isStormError } from "storm:error";
import { format } from "storm:date";${
    context.options.plugins.cli.interactive !== "never"
      ? `
import { confirm, multiselect, select, text } from "@clack/prompts";`
      : ""
  }

export type CLIRequestData = {
  argv: string[];
};

export type ColorName = ${Object.keys(styles.ansi16)
    .map(style => `"${style}"`)
    .join(" | ")};

/**
 * Applies ANSI escape codes to a string.
 *
 * @remarks
 * Split text by /\\\\u001b[\\[|\\]][0-9;]*m/ and wrap non-ANSI parts with open/close
 *
 * \`\`\`typescript
 * const result = applyAnsi("Hello\\\\u001b[31mWorld\\\\u001b[0mAgain", "\\\\u001b[36m", "\\\\u001b[39");
 * console.log(result); // "\\\\u001b[36mHello\\\\u001b[39\\\\u001b[31mWorld\\\\u001b[0m\\\\u001b[36mAgain\\\\u001b[39"
 * \`\`\`
 *
 * @param text - The text to apply ANSI codes to.
 * @param open - The opening ANSI code.
 * @param close - The closing ANSI code.
 * @returns The text with ANSI codes applied.
 */
function applyAnsi(text: string | number, open: string, close: string) {
  const str = String(text);
  const ansiRe = /\\\\u001b[\\[|\\]][0-9;]*m/g;
  const ansiExact = /^\\\\u001b[\\[|\\]][0-9;]*m$/;

  const tokens: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = ansiRe.exec(str)) !== null) {
    if (match.index > last) tokens.push(str.slice(last, match.index));
    tokens.push(match[0]);
    last = match.index + match[0].length;
  }
  if (last < str.length) tokens.push(str.slice(last));

  let result = "";
  for (let i = 0; i < tokens.length; i++) {
    const seg = tokens[i]!;
    if (ansiExact.test(seg)) {
      result += seg;
      continue;
    }
    if (!seg) continue;

    const prevIsAnsi = i > 0 && ansiExact.test(tokens[i - 1]!);
    const nextIsAnsi = i + 1 < tokens.length && ansiExact.test(tokens[i + 1]!);

    result += prevIsAnsi && nextIsAnsi ? seg : \`\${open}\${seg}\${close}\`;
  }

  return result;
}

/**
 * An object containing functions for coloring text. Each function corresponds to a terminal color. See {@link ColorName} for available colors.
 */
export const colors: Record<ColorName, (text: string | number) => string> = {
  ${Object.keys(styles.ansi16)
    .map(
      style =>
        `
  ${style}(text: string | number) {
    try {
      if (!$storm.env.isColorSupported || !$storm.env.supportsColor.stdout) {
        return String(text);
      }

      if ($storm.env.supportsColor.stdout === 1) {
        return applyAnsi(text, "${styles.ansi16[style].open}", "${
          styles.ansi16[style].close
        }");
      } else if ($storm.env.supportsColor.stdout === 2) {
        return applyAnsi(text, "${styles.ansi256[style].open}", "${
          styles.ansi256[style].close
        }");
      }

      return applyAnsi(text, "${styles.ansi16m[style].open}", "${
        styles.ansi16m[style].close
      }");
    } catch {
      return String(text);
    }
  }`
    )
    .join(",\n  ")}
}

/**
 * Gets a color function by name, with an option for a fallback color if the requested color is not found.
 *
 * @param color - The name of the color function to get. See {@link ColorName}.
 * @param fallback - The name of the fallback color function if the requested color is not found. See {@link ColorName}.
 * @returns The color function that corresponds to the requested color, or the fallback color function.
 */
export function getColor(
  color: ColorName,
  fallback: ColorName = "reset"
): (text: string | number) => string {
  return colors[color] || colors[fallback];
}

function splitLineByCharacter(
  maxLineLength: number,
  banner: string[],
  line: string,
  splitCharacters: string[]
) {
  let currentLine = line;
  let result = "";
  for (const character of splitCharacters) {
    for (const segment of currentLine.split(character)) {
      if (stripAnsi(result + segment).length >= maxLineLength) {
        banner.push(result);
        result = character + segment;
      } else {
        result += (result ? character : "") + segment;
      }
    }

    currentLine = currentLine.slice(currentLine.lastIndexOf(character));
  }

  // result += currentLine;
  // if (stripAnsi(result).length >= maxLineLength && new RegExp(\`[\${splitCharacters.join("|")}]\`).test(currentLine)) {
  //   result = splitLineByCharacter(maxLineLength, banner, result, splitCharacters);
  // }

  return result;
}

function splitLine(maxLineLength: number, banner: string[], line: string) {
  if (stripAnsi(line).length < maxLineLength) {
    return line;
  }

  let result = splitLineByCharacter(maxLineLength, banner, line, [" "]);
  if (stripAnsi(result).length >= maxLineLength) {
    result = splitLineByCharacter(
      maxLineLength,
      banner,
      result,
      ["/", "\\\\", ".", ",", "-", ":", "|", "@", "+"]
    );
  }

  return stripAnsi(result).length > maxLineLength ? \`\${result.substring(0, Math.max(maxLineLength - 12, 12))}...\` : result;
}

/**
 * Formats a message for display in the CLI.
 *
 * @param text - The message text to format.
 * @param color - The color to use for the message (default: "brand").
 * @param title - The title to use for the message (default: "Message").
 * @param icon - An optional icon to display with the message.
 * @returns The formatted message string.
 */
export function formatMessage(
  text: string,
  color: ColorName = "brand",
  title = "Message",
  icon?: string,
  stretch = true
) {
  let maxWidth = stretch ? process.stdout.columns - 6 : Math.max(Math.min(process.stdout.columns - 6, ${MAX_MESSAGE_WIDTH}), ${MIN_BANNER_WIDTH});
  if (maxWidth % 2) {
    maxWidth++;
  }

  const colorFn = getColor(color);

  const banner = [] as string[];
  for (const line of text.split("\\n")) {
    banner.push(splitLine(maxWidth, banner, line));
  }

  const maxLine = stretch ? maxWidth : Math.max(Math.max(...banner.map(line => stripAnsi(line).length)), ${
    MIN_MESSAGE_WIDTH
  });
  banner.forEach((line, i) => {
    banner[i] = \` \${colorFn("│")} \${colors.white(line)}\${" ".repeat(Math.max(maxLine - stripAnsi(line).length, 0))} \${colorFn("│")}\`;
  });

  banner.unshift(colorFn(\` ╭── \${icon ? icon + " " : ""}\${title} ─\${"─".repeat(Math.max(maxLine - (icon ? icon.length + 1 : 0) - title.length - 4, 0))}─╮\`));
  banner.unshift("");

  const timestamp = format(new Date(), "keyboardDateTime12h");
  banner.push(colorFn(\` ╰─\${"─".repeat(Math.max(maxLine - timestamp.length - 4, 0))}─ \${timestamp} ──╯\`));
  banner.push("");

  return banner.join("\\n");
}

/**
 * Shows a fatal error message in the CLI.
 *
 * @param details - The fatal error details to display.
 */
export function showFatal(details: string | Error) {
  const text = isStormError(details) ? details.toString() : typeof details === "string" ? details : details.message;
  if (!text) {
    return;
  }

  console.error(formatMessage(text, "fatal", "Fatal Error", "✘"));
}

/**
 * Shows an error message in the CLI.
 *
 * @param details - The error details to display.
 */
export function showError(details: string | Error) {
  const text = isStormError(details) ? details.toString() : typeof details === "string" ? details : details.message;
  if (!text) {
    return;
  }

  console.error(formatMessage(text, "danger", "Error", "✘"));
}

/**
 * Shows a warning message in the CLI.
 *
 * @param details - The warning details to display.
 */
export function showWarning(text: string) {
  console.warn(formatMessage(text, "warning", "Warning", "⚠"));
}

/**
 * Shows a info message in the CLI.
 *
 * @param details - The info details to display.
 */
export function showInfo(text: string) {
  console.info(formatMessage(text, "info", "Info", "ℹ"));
}

/**
 * Shows a help message in the CLI.
 *
 * @param details - The help details to display.
 */
export function showHelp(text: string) {
  console.info(formatMessage(text, "help", "Useful Tip", "✱"));
}

/**
 * Shows a success message in the CLI.
 *
 * @param details - The success details to display.
 */
export function showSuccess(text: string) {
  console.info(formatMessage(text, "success", "Success", "✔"));
}

type LinkOptions = {
  /**
   * Whether to use colored text for the link.
   *
   * @defaultValue "link"
   */
  color?: ColorName | false;

  /**
   * The target for the link. Can be either "stdout" or "stderr".
   *
   * @defaultValue "stdout"
   */
  target?: "stdout" | "stderr";

  /**
   * A fallback function to handle the link in environments that do not support it.
   */
  fallback?: (url: string, text?: string) => string;
};

function parseVersion(versionString = "") {
  if (/^\d{3,4}$/.test(versionString)) {
    const match = /(\d{1,2})(\d{2})/.exec(versionString) ?? [];

    return {
      major: 0,
      minor: Number.parseInt(match[1]!, 10),
      patch: Number.parseInt(match[2]!, 10)
    };
  }

  const versions = (versionString ?? "")
    .split(".")
    .map(n => Number.parseInt(n, 10));

  return {
    major: versions[0],
    minor: versions[1],
    patch: versions[2]
  };
}

/**
 * Check if the current environment supports hyperlinks in the terminal.
 *
 * @param _stream - The stream to check for TTY support (default: process.stdout)
 * @returns Whether hyperlinks are supported
 */
function isHyperlinkSupported(
  _stream: NodeJS.WriteStream = process.stdout
): boolean {
  if (Boolean(process.env.FORCE_HYPERLINK)) {
    return true;
  }

  if (Boolean(process.env.NETLIFY)) {
    return true;
  } else if (!$storm.env.isColorSupported || $storm.env.hasTTY) {
    return false;
  } else if (Boolean(process.env.WT_SESSION)) {
    return true;
  } else if ($storm.env.isWindows || $storm.env.isMinimal || Boolean(process.env.TEAMCITY_VERSION)) {
    return false;
  } else if (Boolean(process.env.TERM_PROGRAM)) {
    const version = parseVersion(process.env.TERM_PROGRAM_VERSION);

    switch (String(process.env.TERM_PROGRAM)) {
      case "iTerm.app": {
        if (version.major === 3) {
          return version.minor !== undefined && version.minor >= 1;
        }

        return version.major !== undefined && version.major > 3;
      }
      case "WezTerm": {
        return version.major !== undefined && version.major >= 20_200_620;
      }

      case "vscode": {
        if (Boolean(process.env.CURSOR_TRACE_ID)) {
          return true;
        }

        return (
          version.minor !== undefined &&
          version.major !== undefined &&
          (version.major > 1 || (version.major === 1 && version.minor >= 72))
        );
      }

      case "ghostty": {
        return true;
      }
    }
  }

  if (Boolean(process.env.VTE_VERSION)) {
    if (process.env.VTE_VERSION === "0.50.0") {
      return false;
    }

    const version = parseVersion(process.env.VTE_VERSION);
    return (
      (version.major !== undefined && version.major > 0) ||
      (version.minor !== undefined && version.minor >= 50)
    );
  }

  if (String(process.env.TERM) === "alacritty") {
    return true;
  }

  return false;
}

/**
 * Create a link to a URL in the console.
 *
 * @param url - The URL to link to.
 * @param text - The text to display for the link. If not provided, the URL will be used as the text.
 * @param options - Options to use when formatting the link.
 * @returns A terminal link
 */
export function link(
  url: string,
  text?: string,
  options: LinkOptions = {}
): string {
  if (
    !isHyperlinkSupported(
      options.target === "stderr" ? process.stderr : process.stdout
    )
  ) {
    return options.fallback
      ? options.fallback(url, text)
      : $storm.env.isColorSupported
        ? \`\${text && text !== url ? \`\${text} at \` : ""}\${colors.underline(
            options.color !== false
              ? getColor(options.color || "link")(url)
              : url
          )}\`
        : \`\${text && text !== url ? \`\${text} at \` : ""} \${url}\`;
  }

  return \`\\u001B]8;;\${url}\\u0007\${text || url}\\u001B]8;;\\u0007\`;
}

/**
 * Strips ANSI escape codes from a string.
 *
 * @param text - The string to strip ANSI codes from.
 * @returns The string without ANSI codes.
 */
export function stripAnsi(text: string) {
  return text.replace(new RegExp([
    String.raw\`[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)\`,
    String.raw\`(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))\`
  ].join("|"), "g"), "");
}

/**
 * Renders a CLI banner with the specified title.
 *
 * @param title - The title to display in the banner.
 * @param description - The description to display in the banner.
 * @returns The rendered banner as a string.
 *
 * @internal
 */
export function renderBanner(title: string, description: string): string {
  let consoleWidth = Math.max(process.stdout.columns - 2, 80);
  if (consoleWidth % 2) {
    consoleWidth++;
  }

  if (title.length % 2) {
    title += " ";
  }

  let width = consoleWidth - 2 > ${MAX_BANNER_WIDTH} ? ${MAX_BANNER_WIDTH} : consoleWidth - 2 < ${MIN_BANNER_WIDTH} ? ${MIN_BANNER_WIDTH} : Math.max(consoleWidth - 18, title.length + 2, ${
    bannerTitleMaxLength ? ` ${bannerTitleMaxLength + 2},` : ""
  } ${MIN_BANNER_WIDTH - 8});
  if (width % 2) {
    width++;
  }

  const banner = [] as string[];
  banner.push(colors.brand(\`┏━━━━ ⏺ ${appTitle} ━ v${
    context.packageJson.version || "1.0.0"
  } \${"━".repeat(width - 12 - ${
    appTitle.length + (context.packageJson.version?.length ?? 5)
  })}┓\`));
  ${
    bannerTitle
      ? `
  const bannerTitlePadding = (width - ${bannerTitleMaxLength}) / 2;
  ${bannerTitle
    .split("\n")
    .map(
      line =>
        `  banner.push(\`\${colors.brand("┃")}\${" ".repeat(bannerTitlePadding)}\${"${
          line
        }"}\${" ".repeat(bannerTitlePadding + width - (bannerTitlePadding * 2 + ${
          stripAnsi(line).length
        }))}\${colors.brand("┃")}\`);`
    )
    .join("\n")}`
      : `  banner.push(colors.brand(\`┃\${" ".repeat(width)}┃\`));`
  }

  const titlePadding = (width - title.length) / 2;
  banner.push(\`\${colors.brand("┃")}\${" ".repeat(titlePadding)}\${colors.whiteBright(colors.bold(title))}\${" ".repeat(titlePadding + width - (titlePadding * 2 + title.length))}\${colors.brand("┃")}\`);
  banner.push(colors.brand(\`┃\${" ".repeat(width)}┃\`));

  const descriptionPadding = (width - description.length) / 2;
  for (const line of (description.length < width * 0.85
    ? \`\${" ".repeat(descriptionPadding)}\${description}\${" ".repeat(descriptionPadding + width - (descriptionPadding * 2 + description.length))}\`
    : description.split(/\\s+/).reduce((ret, word) => {
        const lines = ret.split("\\n");
        if (lines.length !== 0 && (lines[lines.length - 1]!.length + word.length > width * 0.85)) {
          ret += " \\n";
        }

        return \`\${ret}\${word} \`;
      }, "")).split("\\n")) {
    const linePadding = (width - stripAnsi(line).length) / 2;
    banner.push(\`\${colors.brand("┃")}\${" ".repeat(linePadding)}\${colors.gray(line)}\${" ".repeat(linePadding + width - (linePadding * 2 + stripAnsi(line).length))}\${colors.brand("┃")}\`);
  }

  banner.push(colors.brand(\`┃\${" ".repeat(width)}┃\`));
  ${
    author?.name
      ? `banner.push(colors.brand(\`┗\${"━".repeat(width - 7 - ${
          author.name.length
        })}━ ${author.name} ━━━━┛\`));`
      : `banner.push(colors.brand(\`┗\${"━".repeat(width)}┛\`));`
  }

  return banner.map(line => \`\${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}\${line}\${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}\`).join("\\n");
}

/**
 * Renders a CLI footer with the application details
 *
 * @param title - The title to display in the footer.
 * @param description - The description to display in the footer.
 * @returns The rendered footer as a string.
 *
 * @internal
 */
export function renderFooter(): string {
  const consoleWidth = Math.max(process.stdout.columns - 2, ${
    MIN_CONSOLE_WIDTH
  });
  const isLargeConsole = consoleWidth >= ${LARGE_CONSOLE_WIDTH};

  let supportRow = ${
    support || contact || repository
      ? `\`You can reach out to the ${titleCase(
          context.options?.organization &&
            (isSetString(context.options.organization) ||
              context.options.organization.name)
            ? isSetString(context.options.organization)
              ? context.options.organization
              : context.options.organization.name
            : context.options.name
        )} - Support team via \${link("${support || contact || repository}", "${
          support || contact
            ? `our website's ${support ? "support" : "contact"} page`
            : "our repository"
        }")}.\``
      : ""
  }
  const supportRowLength = stripAnsi(supportRow).length;

  const footer = [] as string[];

  footer.push("");
  footer.push(colors.brand(\`\${" ".repeat(Math.max((consoleWidth - (consoleWidth * 0.75)) / 2, 10))}\${"━".repeat(consoleWidth * 0.75)}\${" ".repeat(Math.max((consoleWidth - (consoleWidth * 0.75)) / 2, 10))}\`));
  footer.push("");

  footer.push(\`\${colors.whiteBright(colors.bold("LINKS:"))}\`);
  ${linksColumn1
    .map(
      (line, i) =>
        `footer.push(\`   \${colors.brand(isLargeConsole ? "${line}".padEnd(${
          LARGE_HELP_COLUMN_WIDTH
        }) : "${line}".padEnd(${
          linksMaxLength
        }))}\${link("${linksColumn2[i]}")}\`);`
    )
    .join(" \n")}

  footer.push("");
  footer.push("");${
    homepage || docs || support || contact || repository
      ? `
    ${
      author?.name
        ? `
  footer.push(\`\${" ".repeat(Math.max((consoleWidth - ${
    author.name.length ?? 0
  }) / 2, 10))}\${colors.bold(colors.whiteBright("${
    author.name
  }"))}\${" ".repeat(Math.max((consoleWidth - ${
    author.name.length ?? 0
  }) / 2, 10))}\`);`
        : ""
    }${
      author?.description
        ? `

  const descriptionPadding = Math.max((consoleWidth - ${
    author.description.length
  }) / 2, 10);
  for (const line of (${author.description.length} < consoleWidth * 0.6
    ? \`\${" ".repeat(descriptionPadding)}\${colors.gray("${
      author.description
    }")}\${" ".repeat(Math.max(descriptionPadding + consoleWidth - (descriptionPadding * 2 + ${
      author.description.length
    }), 10))}\`
    : "${author.description}".split(/\\s+/).reduce((ret, word) => {
        const lines = ret.split("\\n");
        if (lines.length !== 0 && (lines[lines.length - 1]!.length + word.length > consoleWidth * 0.6)) {
          ret += " \\n";
        }

        return \`\${ret}\${word} \`;
      }, "")).split("\\n")) {
    const linePadding = Math.max((consoleWidth - stripAnsi(line).length) / 2, 10);
    footer.push(\`\${" ".repeat(linePadding)}\${colors.gray(line)}\${" ".repeat(Math.max(linePadding + consoleWidth - (linePadding * 2 + stripAnsi(line).length), 10))}\`);
  }
  footer.push("");`
        : ""
    }

  if ($storm.env.isUnicodeSupported) {
    const qrCodeLines = \`${renderUnicodeCompact(
      (author?.url || homepage || docs || support || contact || repository)!
    )}\`.split("\\n");
    const qrCodeMaxLength = Math.max(...qrCodeLines.map(line => line.length));
    footer.push(...qrCodeLines.map(line => \`\${" ".repeat(Math.max((consoleWidth - qrCodeMaxLength) / 2, 15))}\${colors.brand(line)}\${" ".repeat(Math.max((consoleWidth - qrCodeMaxLength) / 2, 15))}\`));
  }

  footer.push(\`\${" ".repeat(Math.max((consoleWidth - ${
    (author?.url || homepage || docs || support || contact || repository)
      ?.length ?? 0
  }) / 2, 10))}\${link("${(author?.url ||
    homepage ||
    docs ||
    support ||
    contact ||
    repository)!}")}\${" ".repeat(Math.max((consoleWidth - ${
    (author?.url || homepage || docs || support || contact || repository)
      ?.length ?? 0
  }) / 2, 10))}\`);
  footer.push("");
`
      : ""
  }
  footer.push(colors.gray(\`\${" ".repeat(Math.max((consoleWidth - ${footerHeaderLength}) / 2, 10))}${footerHeader}\${" ".repeat(Math.max((consoleWidth - ${footerHeaderLength}) / 2, 10))}\`));
  if (supportRow) {
    footer.push(colors.gray(\`\${" ".repeat(Math.max((consoleWidth - supportRowLength) / 2, 10))}\${supportRow}\${" ".repeat(Math.max((consoleWidth - supportRowLength) / 2, 10))}\`));
  }

  return footer.join("\\n");
}

${
  context.options.plugins.cli.interactive !== "never"
    ? `// Command-line prompt utilities

interface SelectOption {
  label: string;
  value: string;
  hint?: string;
}

const CANCEL_SYMBOL = Symbol.for("cancel");

interface PromptCommonOptions {
  /**
   * Specify how to handle a cancelled prompt (e.g. by pressing Ctrl+C).
   *
   * @remarks
   * The list of valid cancel strategies include:
   * - \`"default"\` - Resolve the promise with the \`default\` value or \`initial\` value.
   * - \`"undefined\`" - Resolve the promise with \`undefined\`.
   * - \`"null"\` - Resolve the promise with \`null\`.
   * - \`"symbol"\` - Resolve the promise with a symbol \`Symbol.for("cancel")\`.
   * - \`"reject"\`  - Reject the promise with an error.
   *
   * @defaultValue "default"
   */
  cancel?: "reject" | "default" | "undefined" | "null" | "symbol";
}

export type TextPromptOptions = PromptCommonOptions & {
  /**
   * Specifies the prompt type as text.
   *
   * @defaultValue "text"
   */
  type?: "text";

  /**
   * The default text value.
   */
  default?: string;

  /**
   * A placeholder text displayed in the prompt.
   */
  placeholder?: string;

  /**
   * The initial text value.
   */
  initial?: string;
};

export type ConfirmPromptOptions = PromptCommonOptions & {
  /**
   * Specifies the prompt type as confirm.
   */
  type: "confirm";

  /**
   * The initial value for the confirm prompt.
   */
  initial?: boolean;
};

export type SelectPromptOptions = PromptCommonOptions & {
  /**
   * Specifies the prompt type as select.
   */
  type: "select";

  /**
   * The initial value for the select prompt.
   */
  initial?: string;

  /**
   * The options to select from. See {@link SelectOption}.
   */
  options: (string | SelectOption)[];
};

export type MultiSelectPromptOptions = PromptCommonOptions & {
  /**
   * Specifies the prompt type as multiselect.
   */
  type: "multiselect";

  /**
   * The options to select from. See {@link SelectOption}.
   */
  initial?: string[];

  /**
   * The options to select from. See {@link SelectOption}.
   */
  options: (string | SelectOption)[];

  /**
   * Whether the prompt requires at least one selection.
   */
  required?: boolean;
};

/**
 * Defines a combined type for all prompt options.
 */
export type PromptOptions =
  | TextPromptOptions
  | ConfirmPromptOptions
  | SelectPromptOptions
  | MultiSelectPromptOptions;

type inferPromptReturnType<T extends PromptOptions> =
  T extends TextPromptOptions
    ? string
    : T extends ConfirmPromptOptions
      ? boolean
      : T extends SelectPromptOptions
        ? T["options"][number] extends SelectOption
          ? T["options"][number]["value"]
          : T["options"][number]
        : T extends MultiSelectPromptOptions
          ? T["options"]
          : unknown;

type inferPromptCancelReturnType<T extends PromptOptions> = T extends {
  cancel: "reject";
}
  ? never
  : T extends { cancel: "default" }
    ? inferPromptReturnType<T>
    : T extends { cancel: "undefined" }
      ? undefined
      : T extends { cancel: "null" }
        ? null
        : T extends { cancel: "symbol" }
          ? typeof CANCEL_SYMBOL
          : inferPromptReturnType<T> /* default */;

/**
 * Asynchronously prompts the user for input based on specified options.
 * Supports text, confirm, select and multi-select prompts.
 *
 * @param message - The message to display in the prompt.
 * @param opts - The prompt options. See {@link PromptOptions}.
 * @returns A promise that resolves with the user's response, the type of which is inferred from the options. See {@link inferPromptReturnType}.
 */
export async function prompt<
  _ = any,
  __ = any,
  T extends PromptOptions = TextPromptOptions
>(
  message: string,
  opts: PromptOptions = {}
): Promise<inferPromptReturnType<T> | inferPromptCancelReturnType<T>> {
  const handleCancel = (value: unknown) => {
    if (
      typeof value !== "symbol" ||
      value.toString() !== "Symbol(clack:cancel)"
    ) {
      return value;
    }

    switch (opts.cancel) {
      case "reject": {
        const error = new Error("Prompt cancelled by user");
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, prompt);
        }
        throw error;
      }
      case "undefined": {
        return undefined;
      }
      case "null": {
        return null;
      }
      case "symbol": {
        return CANCEL_SYMBOL;
      }
      default:
      case undefined:
      case "default": {
        return (opts as TextPromptOptions).default ?? opts.initial;
      }
    }
  };

  if (!opts.type || opts.type === "text") {
    return (await text({
      message,
      defaultValue: opts.default,
      placeholder: opts.placeholder,
      initialValue: opts.initial as string
    }).then(handleCancel)) as any;
  }

  if (opts.type === "confirm") {
    return (await confirm({
      message,
      initialValue: opts.initial
    }).then(handleCancel)) as any;
  }

  if (opts.type === "select") {
    return (await select({
      message,
      options: opts.options.map(o =>
        typeof o === "string" ? { value: o, label: o } : o
      ),
      initialValue: opts.initial
    }).then(handleCancel)) as any;
  }

  if (opts.type === "multiselect") {
    return (await multiselect({
      message,
      options: opts.options.map(o =>
        typeof o === "string" ? { value: o, label: o } : o
      ),
      required: opts.required,
      initialValues: opts.initial
    }).then(handleCancel)) as any;
  }

  throw new StormError({
    type: "general",
    code: 16,
    params: [opts.type as string]
  });
}
`
    : ""
}

function toArr(arr: any) {
  return arr == null ? [] : Array.isArray(arr) ? arr : [arr];
}

function toVal(out: any, key: string, val: any, opts: any) {
  let x;
  const old = out[key];
  const nxt = ~opts.string.indexOf(key)
    ? val == null || val === true
      ? ""
      : String(val)
    : typeof val === "boolean"
      ? val
      : ~opts.boolean.indexOf(key)
        ? val === "false"
          ? false
          : val === "true" ||
            (out._.push(((x = +val), x * 0 === 0) ? x : val), !!val)
        : ((x = +val), x * 0 === 0)
          ? x
          : val;
  out[key] =
    old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}

// Parser is based on https://github.com/lukeed/mri

export function parseArgs(args: any[], opts: any) {
  args = args || [];
  opts = opts || {};

  let k;
  let arr;
  let arg;
  let name;
  let val;
  const out = { _: [] } as Record<string, any> & { _: any[] };
  let i = 0;
  let j = 0;
  let idx = 0;
  const len = args.length;

  const alibi = opts.alias !== void 0;
  const strict = opts.unknown !== void 0;
  const defaults = opts.default !== void 0;

  opts.alias = opts.alias || {};
  opts.string = toArr(opts.string);
  opts.boolean = toArr(opts.boolean);

  if (alibi) {
    for (k in opts.alias) {
      arr = opts.alias[k] = toArr(opts.alias[k]);
      for (i = 0; i < arr.length; i++) {
        (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
      }
    }
  }

  for (i = opts.boolean.length; i-- > 0; ) {
    arr = opts.alias[opts.boolean[i]] || [];
    for (j = arr.length; j-- > 0; ) {
      opts.boolean.push(arr[j]);
    }
  }

  for (i = opts.string.length; i-- > 0; ) {
    arr = opts.alias[opts.string[i]] || [];
    for (j = arr.length; j-- > 0; ) {
      opts.string.push(arr[j]);
    }
  }

  if (defaults) {
    for (k in opts.default) {
      name = typeof opts.default[k];
      arr = opts.alias[k] = opts.alias[k] || [];
      if (opts[name] !== void 0) {
        opts[name].push(k);
        for (i = 0; i < arr.length; i++) {
          opts[name].push(arr[i]);
        }
      }
    }
  }

  const keys = strict ? Object.keys(opts.alias) : [];

  for (i = 0; i < len; i++) {
    arg = args[i];

    if (arg === "--") {
      out._ = out._.concat(args.slice(++i));
      break;
    }

    for (j = 0; j < arg.length; j++) {
      if (arg.charCodeAt(j) !== 45) break; // "-"
    }

    if (j === 0) {
      out._.push(arg);
    } else if (arg.substring(j, j + 3) === "no-") {
      name = arg.substring(j + 3);
      if (strict && !~keys.indexOf(name)) {
        return opts.unknown(arg);
      }
      out[name] = false;
    } else {
      for (idx = j + 1; idx < arg.length; idx++) {
        if (arg.charCodeAt(idx) === 61) break; // "="
      }

      name = arg.substring(j, idx);
      val =
        arg.substring(++idx) ||
        i + 1 === len ||
        \`\${args[i + 1]}\`.charCodeAt(0) === 45 ||
        args[++i];
      arr = j === 2 ? [name] : name;

      for (idx = 0; idx < arr.length; idx++) {
        name = arr[idx];
        if (strict && !~keys.indexOf(name))
          return opts.unknown("-".repeat(j) + name);
        toVal(out, name, idx + 1 < arr.length || val, opts);
      }
    }
  }

  if (defaults) {
    for (k in opts.default) {
      if (out[k] === void 0) {
        out[k] = opts.default[k];
      }
    }
  }

  if (alibi) {
    for (k in out) {
      arr = opts.alias[k] || [];
      while (arr.length > 0) {
        out[arr.shift()] = out[k];
      }
    }
  }

  return out;
}



`;
}
