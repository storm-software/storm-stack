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

import { getFileHeader } from "@storm-stack/core/helpers";
import type { Options } from "@storm-stack/core/types";
import { stripAnsi } from "@stryke/cli/utils/strip-ansi";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isString } from "@stryke/type-checks/is-string";
import type { StormStackCLIPresetContext } from "../types/build";
import type { StormStackCLIPresetConfig } from "../types/config";

export function writeRuntime<TOptions extends Options = Options>(
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
) {
  const appTitle = titleCase(
    (Array.isArray(config.bin) ? config.bin[0] : config.bin) ||
      context.packageJson?.name
  );

  let author = config.author;
  if (!author) {
    if (context.workspaceConfig.organization) {
      author = context.workspaceConfig.organization;
    } else if (context.packageJson?.author) {
      author = isString(context.packageJson.author)
        ? context.packageJson.author
        : context.packageJson.author?.name;
    } else if (
      context.packageJson?.contributors &&
      context.packageJson.contributors.length > 0
    ) {
      author = isString(context.packageJson.contributors[0])
        ? context.packageJson.contributors[0]
        : context.packageJson.contributors[0]?.name;
    }
  }

  if (author) {
    author = titleCase(author);
  }

  let homepage = config.homepage;
  if (!homepage) {
    if (context.workspaceConfig.homepage) {
      homepage = context.workspaceConfig.homepage;
    } else if (context.packageJson?.homepage) {
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

  let support = config.support;
  if (!support) {
    if (context.workspaceConfig.support) {
      support = context.workspaceConfig.support;
    } else if (
      isObject(context.packageJson?.bugs) &&
      context.packageJson?.bugs?.url
    ) {
      support = context.packageJson.bugs.url;
    }
  }

  let contact = config.contact;
  if (!contact) {
    if (context.workspaceConfig.contact) {
      contact = context.workspaceConfig.contact;
    } else if (
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

  let docs = config.docs;
  if (!docs) {
    if (context.workspaceConfig.docs) {
      docs = context.workspaceConfig.docs;
    } else if (context.packageJson?.docs) {
      docs = context.packageJson.docs;
    }
  }

  let repository = config.repository;
  if (!repository) {
    if (context.workspaceConfig.repository) {
      repository = context.workspaceConfig.repository;
    } else if (context.packageJson?.repository) {
      repository = isString(context.packageJson.repository)
        ? context.packageJson.repository
        : context.packageJson.repository?.url;
    }
  }

  const footerHeader = `${appTitle} is authored and maintained by ${homepage ? `\${link("${homepage}", "${author}")}` : author}.`;
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

  const linksMaxLength = Math.max(...linksColumn1.map(line => line.length)) + 2;

  return `${getFileHeader()}

${
  config.interactive !== "never"
    ? `import { confirm, multiselect, select, text } from "@clack/prompts";
import { StormError } from "./error";`
    : ""
}
import { isHyperlinkSupported } from "@stryke/env/environment-checks";
import { getRuntimeInfo } from "./env";

const runtimeInfo = getRuntimeInfo();

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

/**
 * An object containing functions for coloring text. Each function corresponds to a terminal color. See {@link ColorName} for available colors.
 */
export const colors = (
  runtimeInfo.isColorSupported
    ? colorDefs
    : Object.fromEntries(Object.keys(colorDefs).map(key => [key, String]))
) as Record<ColorName, (text: string | number) => string>;

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
   * @defaultValue "cyan"
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
      : runtimeInfo.isColorSupported
        ? \`\${text ? \`\${text} at \` : ""} \${colors.underline(
            options.color !== false
              ? getColor(options.color || "cyan")(url)
              : url
          )}\`
        : \`\${text ? \`\${text} at \` : ""} \${url}\`;
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

function stripAnsi(text: string) {
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
 */
export function renderBanner(title: string, description: string): string {
  const consoleWidth = Math.max(process.stdout.columns - 2, 46);
  const width = Math.max(Math.min(consoleWidth, Math.max(title.length + 2, 40)), 44);

  const banner = [] as string[];
  banner.push(colors.cyan(\`┏━━━━ ${appTitle} ━━ v${
    context.packageJson.version || "1.0.0"
  } \${"━".repeat(width - 10 - ${
    appTitle.length + (context.packageJson.version?.length ?? 5)
  })}┓\`));
  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
  banner.push(\`\${colors.cyan("┃")}\${" ".repeat((width - title.length) / 2)}\${colors.whiteBright(colors.bold(title))}\${" ".repeat((width - title.length) / 2)}\${colors.cyan("┃")}\`);
  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
  banner.push(\`\${colors.cyan("┃")}\${
    colors.dim(description.length < width - 2
      ? \`\${" ".repeat((width - description.length) / 2)}\${description}\${" ".repeat((width - description.length) / 2)}\`
      : description.split(" ").reduce((ret, word) => {
          const lines = ret.split("\\n");
          if (lines[lines.length - 1].length + word.length > width - 2) {
            ret += "\\n";
          }

          ret += \`\${word} \`;
          return ret;
        }, "").trim())} \${colors.cyan("┃")}\`);
  banner.push(colors.cyan(\`┃\${" ".repeat(width)}┃\`));
  ${
    author
      ? `banner.push(colors.cyan(\`┗\${"━".repeat(width - 7 - ${author.length})}━ ${homepage ? `\${link("${homepage}", "${author}")}` : author} ━━━━┛\`));`
      : `banner.push(colors.cyan(\`┗\${"━".repeat(width)}┛\`));`
  }

  return banner
    .map(line => \`\${" ".repeat((consoleWidth - line.length) / 2)}\${line}\${" ".repeat((consoleWidth - line.length) / 2)}\`)
    .join("\\n");
}

/**
 * Renders a CLI footer with the application details
 *
 * @param title - The title to display in the footer.
 * @param description - The description to display in the footer.
 * @returns The rendered footer as a string.
 */
export function renderFooter(): string {
  const consoleWidth = Math.max(process.stdout.columns - 2, 46);

  let supportRow = ${
    config.support ||
    context.workspaceConfig.support ||
    context.workspaceConfig?.contact ||
    context.workspaceConfig?.repository
      ? `\`You can reach out to the ${titleCase(
          context.workspaceConfig?.organization || context.options.name
        )} - Support team via \${link("${
          config.support ||
          context.workspaceConfig.support ||
          context.workspaceConfig.contact ||
          context.workspaceConfig.repository
        }", "${
          config.support ||
          context.workspaceConfig.support ||
          context.workspaceConfig.contact
            ? `our website's ${config.support || context.workspaceConfig.support ? "support" : "contact"} page`
            : "our repository"
        }")}.\``
      : ""
  }
  const supportRowLength = stripAnsi(supportRow).length;

  const footer = [] as string[];
  footer.push(\`\\n  \${colors.bold("Links:")}\`);
  ${linksColumn1.map((line, i) => `\`    ${`\${colors.bold(link("${line}"))}`.padEnd(linksMaxLength)}${linksColumn2[i]}\``).join(" \n")}

  footer.push("\\n");
  footer.push(\`\${" ".repeat((consoleWidth - ${footerHeaderLength}) / 2)}${footerHeader}\${" ".repeat((consoleWidth - ${footerHeaderLength}) / 2)}\`);
  if (supportRow) {
    footer.push(\`\${" ".repeat((consoleWidth - supportRowLength) / 2)}\${supportRow}\${" ".repeat((consoleWidth - supportRowLength) / 2)}\`);
  }

  return footer;
}

${
  config.interactive !== "never"
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
   * Default strategy is \`"default"\`.
   *
   * - \`"default"\` - Resolve the promise with the \`default\` value or \`initial\` value.
   * - \`"undefined\`" - Resolve the promise with \`undefined\`.
   * - \`"null"\` - Resolve the promise with \`null\`.
   * - \`"symbol"\` - Resolve the promise with a symbol \`Symbol.for("cancel")\`.
   * - \`"reject"\`  - Reject the promise with an error.
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
        const error = new Error("Prompt cancelled.");
        error.name = "ConsolaPromptCancelledError";
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
