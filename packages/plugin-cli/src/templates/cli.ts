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

import {
  getColor,
  getGradient
} from "@storm-software/config-tools/utilities/colors";
import { getFileHeader } from "@storm-stack/core/lib";
import { WorkspaceConfig } from "@storm-stack/core/types/config";
import { stripAnsi } from "@stryke/cli/utils/strip-ansi";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { render } from "cfonts";
import { defu } from "defu";
import { renderUnicodeCompact } from "uqr";
import {
  LARGE_CONSOLE_WIDTH,
  LARGE_HELP_COLUMN_WIDTH,
  MIN_BANNER_WIDTH,
  MIN_CONSOLE_WIDTH
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
    const brandColor = getColor(
      "brand",
      context.options.colors as Partial<Pick<WorkspaceConfig, "colors">>
    );
    const gradient = getGradient(
      context.options.colors as Parameters<typeof getGradient>[0]
    );

    const result = render(
      isSetString(context.options.plugins.cli.title)
        ? titleCase(context.options.plugins.cli.title)
        : titleCase(context.options.plugins.cli.title.text),
      defu(
        isSetObject(context.options.plugins.cli.title)
          ? context.options.plugins.cli.title
          : {},
        {
          font: "slick",
          align: "center",
          colors: [brandColor],
          // background: "transparent",
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

  return `
/**
 * The CLI module provides a unified command-line interface for the Storm Stack runtime.
 *
 * @module storm:cli
 */

${getFileHeader()}

${
  context.options.plugins.cli.interactive !== "never"
    ? `import { confirm, multiselect, select, text } from "@clack/prompts";
import { StormError } from "storm:error";`
    : ""
}

export type CLIRequestData = {
  argv: string[];
};

function replaceClose(
  index: number,
  string: string,
  close: string,
  replace: string,
  head = string.slice(0, Math.max(0, index)) + replace,
  tail = string.slice(Math.max(0, index + close.length)),
  next = tail.indexOf(close)
): string {
  return head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
}

function init(open: number, close: number, replace?: string) {
  const _open = \`\\u001B[\${open}m\`;
  const _close = \`\\u001B[\${close}m\`;
  const _replace = replace || _open;

  return (str: string) =>
    str || !(str === "" || str === undefined)
      ? \`\${str}\`.indexOf(_close, _open.length + 1) < 0
        ? _open + str + _close
        : _open +
          replaceClose(
            \`\${str}\`.indexOf(_close, _open.length + 1),
            str,
            _close,
            _replace
          ) +
          _close
      : "";
}

const colorDefs = {
  reset: init(0, 0),
  bold: init(1, 22, "\\u001B[22m\\u001B[1m"),
  dim: init(2, 22, "\\u001B[22m\\u001B[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49)
};

export type ColorName = keyof typeof colorDefs;
export type ColorFn = (text: string | number) => string;
export type Colors = Record<ColorName, ColorFn>;

/**
 * An object containing functions for coloring text. Each function corresponds to a terminal color. See {@link ColorName} for available colors.
 */
export const colors = new Proxy<Colors>({} as Colors, {
  get(_, prop: string) {
    try {
      if ($storm.config.NO_COLOR && prop in colorDefs) {
        return colorDefs[prop];
      }

      return (text: string | number) => String(text);
    } catch {
      return (text: string | number) => String(text);
    }
  }
});

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

type LinkOptions = {
  /**
   * Whether to use colored text for the link.
   *
   * @defaultValue "blueBright"
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
  if ($storm.config.FORCE_HYPERLINK) {
    return true;
  }

  if ($storm.config.NETLIFY) {
    return true;
  } else if (!$storm.env.isColorSupported || $storm.env.hasTTY) {
    return false;
  } else if ($storm.config.WT_SESSION) {
    return true;
  } else if ($storm.env.isWindows || $storm.env.isMinimal || $storm.config.TEAMCITY_VERSION) {
    return false;
  } else if ($storm.config.TERM_PROGRAM) {
    const version = parseVersion($storm.config.TERM_PROGRAM_VERSION);

    switch ($storm.config.TERM_PROGRAM) {
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
        if ($storm.config.CURSOR_TRACE_ID) {
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

  if ($storm.config.VTE_VERSION) {
    if ($storm.config.VTE_VERSION === "0.50.0") {
      return false;
    }

    const version = parseVersion($storm.config.VTE_VERSION);
    return (
      (version.major !== undefined && version.major > 0) ||
      (version.minor !== undefined && version.minor >= 50)
    );
  }

  if ($storm.config.TERM === "alacritty") {
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
              ? getColor(options.color || "blueBright")(url)
              : url
          )}\`
        : \`\${text && text !== url ? \`\${text} at \` : ""} \${url}\`;
  }

  return [
    "\\u001B]",
    "8",
    ";",
    ";",
    url,
    "\\u0007",
    text || url,
    "\\u001B]",
    "8",
    ";",
    ";",
    "\\u0007"
  ].join("");
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

  let width = Math.max(Math.min(consoleWidth, Math.max(title.length + 2, ${MIN_BANNER_WIDTH - 8})), ${MIN_BANNER_WIDTH});
  if (width % 2) {
    width++;
  }

  const banner = [] as string[];
  banner.push(colors.cyan(\`┏━━━━ ⏺ ${appTitle} ━ v${
    context.packageJson.version || "1.0.0"
  } \${"━".repeat(width - 12 - ${
    appTitle.length + (context.packageJson.version?.length ?? 5)
  })}┓\`));
  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));

  const titlePadding = (width - title.length) / 2;
  banner.push(\`\${colors.cyan("┃")}\${" ".repeat(titlePadding)}\${colors.whiteBright(colors.bold(title))}\${" ".repeat(titlePadding + width - (titlePadding * 2 + title.length))}\${colors.cyan("┃")}\`);
  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));

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
    banner.push(\`\${colors.cyan("┃")}\${" ".repeat(linePadding)}\${colors.gray(line)}\${" ".repeat(linePadding + width - (linePadding * 2 + stripAnsi(line).length))}\${colors.cyan("┃")}\`);
  }

  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
  ${
    author?.name
      ? `banner.push(colors.cyan(\`┗\${"━".repeat(width - 7 - ${
          author.name.length
        })}━ ${author.name} ━━━━┛\`));`
      : `banner.push(colors.cyan(\`┗\${"━".repeat(width)}┛\`));`
  }

  return \`${
    bannerTitle
      ? `
${bannerTitle}

`
      : ""
  }\${banner
    .map(line => \`\${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}\${line}\${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}\`)
    .join("\\n")}
\`;
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
  footer.push(colors.cyan(\`\${" ".repeat(Math.max((consoleWidth - (consoleWidth * 0.75)) / 2, 10))}\${"━".repeat(consoleWidth * 0.75)}\${" ".repeat(Math.max((consoleWidth - (consoleWidth * 0.75)) / 2, 10))}\`));
  footer.push("");

  footer.push(\`\${colors.whiteBright(colors.bold("LINKS:"))}\`);
  ${linksColumn1
    .map(
      (line, i) =>
        `footer.push(\`   \${isLargeConsole ? colors.cyan("${line}".padEnd(${
          LARGE_HELP_COLUMN_WIDTH
        })) : "${line}".padEnd(${
          linksMaxLength
        })}\${link("${linksColumn2[i]}")}\`);`
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
    footer.push(...qrCodeLines.map(line => \`\${" ".repeat(Math.max((consoleWidth - qrCodeMaxLength) / 2, 15))}\${line}\${" ".repeat(Math.max((consoleWidth - qrCodeMaxLength) / 2, 15))}\`));
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
