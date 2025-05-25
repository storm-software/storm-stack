var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// examples/cli-app/.storm/commands/vars/set/handle.ts
import { deserialize, serialize } from "@deepkit/type";

// examples/cli-app/.storm/runtime/cli.ts
import { confirm, multiselect, select, text } from "@clack/prompts";
import { isHyperlinkSupported } from "@stryke/env/environment-checks";

// examples/cli-app/.storm/runtime/env.ts
import { isCI, isInteractive } from "@stryke/env/ci-checks";
import { hasTTY, isColorSupported, isDebug, isDevelopment, isLinux, isMacOS, isMinimal, isProduction, isStaging, isTest, isWindows, nodeMajorVersion, nodeVersion } from "@stryke/env/environment-checks";
import { getEnvPaths as _getEnvPaths } from "@stryke/env/get-env-paths";
import { providerInfo } from "@stryke/env/providers";
import { runtimeInfo as baseRuntimeInfo, isBun, isDeno, isEdgeLight, isFastly, isNetlify, isNode, isWorkerd } from "@stryke/env/runtime-checks";
function getBuildInfo() {
  return {
    name: "examples-cli-app",
    packageName: "@storm-stack/examples-cli-app",
    version: "0.0.1",
    buildId: "5WQRDz8WliEPyowOJVfVYIRl",
    timestamp: 1748147275207 ? Number(1748147275207) : 0,
    releaseId: "_rqxkVkX0KcpYY3gh7DaRZjR",
    mode: "production",
    platform: "node",
    isTest,
    isDebug: isDebug || isDevelopment,
    isProduction,
    isStaging,
    isDevelopment
  };
}
__name(getBuildInfo, "getBuildInfo");
getBuildInfo.__type = ["StormBuildInfo", "getBuildInfo", "Get the build information for the current application.", 'P"w!/"?#'];
var _envPaths;
function getEnvPaths() {
  if (!_envPaths) {
    _envPaths = _getEnvPaths({
      orgId: "storm-software",
      appId: "examples-cli-app"
    });
  }
  return _envPaths;
}
__name(getEnvPaths, "getEnvPaths");
getEnvPaths.__type = ["EnvPaths", "getEnvPaths", "Get the environment paths for the current application.", 'P"w!/"?#'];
function getRuntimeInfo() {
  return {
    ...baseRuntimeInfo,
    isNode,
    isBun,
    isDeno,
    isFastly,
    isNetlify,
    isEdgeLight,
    isWorkerd,
    hasTTY,
    isWindows,
    isLinux,
    isMacOS,
    isCI: isCI(),
    isInteractive: isInteractive(),
    isMinimal,
    isColorSupported,
    isServer: isNode || isDeno || isBun || isEdgeLight || isFastly || isNetlify || isWorkerd,
    nodeVersion,
    nodeMajorVersion,
    provider: providerInfo
  };
}
__name(getRuntimeInfo, "getRuntimeInfo");
getRuntimeInfo.__type = ["StormRuntimeInfo", "getRuntimeInfo", "Get the runtime information for the current application.", 'P"w!/"?#'];

// examples/cli-app/.storm/runtime/error.ts
import { isError } from "@stryke/type-checks/is-error";
import { isFunction } from "@stryke/type-checks/is-function";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
function __assignType(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType, "__assignType");
function getDefaultCode(_type) {
  return 1;
}
__name(getDefaultCode, "getDefaultCode");
getDefaultCode.__type = ["ErrorType", "_type", "getDefaultCode", "Get the default error code for the given error type.", `P"w!2"'/#?$`];
function getDefaultErrorName(type) {
  switch (type) {
    case "not_found":
      return "Not Found Error";
    case "validation":
      return "Validation Error";
    case "service_unavailable":
      return "System Unavailable Error";
    case "action_unsupported":
      return "Unsupported Error";
    case "security":
      return "Security Error";
    case "general":
    case "unknown":
    default:
      return "System Error";
  }
}
__name(getDefaultErrorName, "getDefaultErrorName");
getDefaultErrorName.__type = ["ErrorType", "type", "getDefaultErrorName", "Get the default error name for the given error type.", 'P"w!2"&/#?$'];
function createStormError(cause, type = "general", data) {
  if (isStormError(cause)) {
    const result = cause;
    result.data ??= data;
    return result;
  }
  if (isError(cause)) {
    if (isStormError(cause) || cause.name === "StormError") {
      return cause;
    }
    return new StormError({
      type,
      code: getDefaultCode(type),
      name: cause.name,
      stack: cause.stack,
      cause,
      data
    });
  }
  const causeType = typeof cause;
  if (causeType === "undefined" || causeType === "function" || cause === null) {
    return new StormError({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      cause,
      type,
      data
    });
  }
  if (causeType !== "object") {
    return new StormError({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      type,
      data
    });
  }
  if (isObject(cause)) {
    const err = new StormError({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      type,
      data
    });
    for (const key of Object.keys(cause)) {
      err[key] = cause[key];
    }
    return err;
  }
  return new StormError({
    name: getDefaultErrorName(type),
    code: getDefaultCode(type),
    cause,
    type,
    data
  });
}
__name(createStormError, "createStormError");
createStormError.__type = ["cause", "ErrorType", "type", () => "general", "data", () => StormError, "createStormError", "Creates a new {@link StormError} instance from an unknown cause value", `P#2!"w"2#>$"2%8P7&/'?(`];
function isStormError(value) {
  return isError(value) && isSetString(value?.code) && isSetString(value?.type) && isSetString(value?.stack);
}
__name(isStormError, "isStormError");
isStormError.__type = ["value", "isStormError", "Type-check to determine if `obj` is a `StormError` object", 'P#2!!/"?#'];
var StormError = class _StormError extends Error {
  static {
    __name(this, "StormError");
  }
  __proto__ = Error;
  /**
   * The stack trace
   */
  #stack;
  /**
   * The inner error
   */
  #cause;
  /**
   * The error code
   */
  code;
  /**
   * The error message parameters
   */
  params = [];
  /**
   * The type of error event
   */
  type = "general";
  /**
   * Additional data to be passed with the error
   */
  data;
  /**
   * The StormError constructor
   *
   * @param options - The options for the error
   * @param type - The type of error
   */
  constructor(optionsOrMessage, type = "general") {
    super("An error occurred during processing", isSetString(optionsOrMessage) ? void 0 : { cause: optionsOrMessage.cause });
    if (isSetString(optionsOrMessage)) {
      this.message = optionsOrMessage;
      this.type = type || "general";
      this.code = getDefaultCode(this.type);
    } else {
      this.code = optionsOrMessage.code;
      if (optionsOrMessage.type) {
        this.type = optionsOrMessage.type;
      }
      if (optionsOrMessage.params) {
        this.params = optionsOrMessage.params;
      }
      if (optionsOrMessage.stack) {
        this.#stack = optionsOrMessage.stack;
      } else if (isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.#stack = new Error("").stack;
      }
      this.name = optionsOrMessage.name || getDefaultErrorName(this.type);
      this.data = optionsOrMessage.data;
      this.cause ??= optionsOrMessage.cause;
    }
    Object.setPrototypeOf(this, _StormError.prototype);
  }
  /**
   * The cause of the error
   */
  get cause() {
    return this.#cause;
  }
  /**
   * The cause of the error
   */
  set cause(cause) {
    this.#cause = createStormError(cause, this.type, this.data);
    if (this.#cause.stack) {
      this.#stack = this.#cause.stack;
    }
  }
  /**
   * The parsed stack traces from the raw stack string
   *
   * @returns The parsed stack traces
   */
  get stacktrace() {
    const stacktrace = [];
    if (this.#stack) {
      for (const line of this.#stack.split("\n")) {
        const parsed = /^\s+at (?:(?<function>[^)]+) \()?(?<source>[^)]+)\)?$/u.exec(line)?.groups;
        if (!parsed) {
          continue;
        }
        if (!parsed.source) {
          continue;
        }
        const parsedSource = /^(?<source>.+):(?<line>\d+):(?<column>\d+)$/u.exec(parsed.source)?.groups;
        if (parsedSource) {
          Object.assign(parsed, parsedSource);
        }
        if (/^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[a-z]:[/\\]/i.test(parsed.source)) {
          parsed.source = `file://${parsed.source}`;
        }
        if (parsed.source === import.meta.url) {
          continue;
        }
        for (const key of ["line", "column"]) {
          if (parsed[key]) {
            parsed[key] = Number(parsed[key]).toString();
          }
        }
        stacktrace.push(parsed);
      }
    }
    return stacktrace;
  }
  /**
   * Prints a displayable/formatted stack trace
   *
   * @returns The stack trace string
   */
  get stack() {
    return this.stacktrace.filter(Boolean).map(__assignType((line) => {
      return `    at ${line.function} (${line.source}:${line.line}:${line.column})`;
    }, ["line", "", 'P"2!"/"'])).join("\n");
  }
  /**
   * Store the stack trace
   */
  set stack(stack) {
    this.#stack = stack;
  }
  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  get originalStack() {
    return this.#stack || "";
  }
  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  set originalStack(stack) {
    this.#stack = stack;
  }
  /**
   * A URL to a page that displays the error message details
   */
  get url() {
    const url = new URL("https://stormsoftware.com/errors");
    url.pathname = `${this.type.toLowerCase().replaceAll("_", "-")}/${String(this.code)}/`;
    if (this.params.length > 0) {
      url.pathname += this.params.map(__assignType((param) => encodeURI("" + param).replaceAll(/%7c/gi, "|").replaceAll("#", "%23").replaceAll("?", "%3F").replaceAll(/%252f/gi, "%2F").replaceAll("&", "%26").replaceAll("+", "%2B").replaceAll("/", "%2F"), ["param", "", 'P"2!"/"'])).join("/");
    }
    return url.toString();
  }
  /**
   * Prints the display error message string
   *
   * @param includeData - Whether to include the data in the error message
   * @returns The display error message string
   */
  toDisplay(includeData = false) {
    return `${this.name && this.name !== this.constructor.name ? this.code ? `${this.name} ` : this.name : ""} ${this.code ? this.code && this.name ? `[${this.type} - ${this.code}]` : `${this.type} - ${this.code}` : this.name ? `[${this.type}]` : this.type}: Please review the details of this error at the following URL: ${this.url}${includeData && this.data ? `
Related details: ${JSON.stringify(this.data)}` : ""}`;
  }
  /**
   * Prints the error message and stack trace
   *
   * @param stacktrace - Whether to include the stack trace in the error message
   * @param includeData - Whether to include the data in the error message
   * @returns The error message and stack trace string
   */
  toString(stacktrace = true, includeData = false) {
    return this.toDisplay(includeData) + (stacktrace ? "" : ` 
Stack Trace: 
${this.stack}`);
  }
  static __type = [() => Error, "__proto__", function() {
    return Error;
  }, "#stack", "The stack trace", "IStormError", "#cause", "The inner error", "code", "The error code", "params", function() {
    return [];
  }, "The error message parameters", "ErrorType", "type", function() {
    return "general";
  }, "The type of error event", "data", "Additional data to be passed with the error", "StormErrorOptions", "optionsOrMessage", () => "general", "constructor", "The StormError constructor", "includeData", "toDisplay", "Prints the display error message string", "stacktrace", "toString", "Prints the error message and stack trace", "StormError", "A wrapper around the base JavaScript Error class to be used in Storm Stack applications", `P7!!3">#&3$8?%"w&3'8?('3)?*!3+>,?-"w.3/>0?1"328?3PP"w4&J25"w.2/>6"07?8!!!!!P"29&0:?;P"2<"29&0=?>5"w&x"w??@`];
};

// examples/cli-app/.storm/runtime/cli.ts
function __assignType2(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType2, "__assignType");
var runtimeInfo = getRuntimeInfo();
function replaceClose(index, string, close, replace, head = string.slice(0, Math.max(0, index)) + replace, tail = string.slice(Math.max(0, index + close.length)), next = tail.indexOf(close)) {
  return head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
}
__name(replaceClose, "replaceClose");
replaceClose.__type = ["index", "string", "close", "replace", "head", "tail", "next", "replaceClose", `P'2!&2"&2#&2$"2%"2&"2'&/(`];
function init(open, close, replace) {
  const _open = `\x1B[${open}m`;
  const _close = `\x1B[${close}m`;
  const _replace = replace || _open;
  return __assignType2((str) => str || !(str === "" || str === void 0) ? `${str}`.indexOf(_close, _open.length + 1) < 0 ? _open + str + _close : _open + replaceClose(`${str}`.indexOf(_close, _open.length + 1), str, _close, _replace) + _close : "", ["str", "", 'P&2!"/"']);
}
__name(init, "init");
init.__type = ["open", "close", "replace", "init", `P'2!'2"&2#8"/$`];
var colorDefs = {
  reset: init(0, 0),
  bold: init(1, 22, "\x1B[22m\x1B[1m"),
  dim: init(2, 22, "\x1B[22m\x1B[2m"),
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
var __\u03A9ColorName = [() => colorDefs, "ColorName", 'i!gw"y'];
var colors = runtimeInfo.isColorSupported ? colorDefs : Object.fromEntries(Object.keys(colorDefs).map(__assignType2((key) => [key, String], ["key", "", 'P"2!"/"'])));
function getColor(color, fallback = "reset") {
  return colors[color] || colors[fallback];
}
__name(getColor, "getColor");
getColor.__type = [() => __\u03A9ColorName, "color", () => __\u03A9ColorName, "fallback", () => "reset", "text", "", "getColor", "Gets a color function by name, with an option for a fallback color if the requested color is not found.", `Pn!2"n#2$>%PP&'J2&&/'/(?)`];
var __\u03A9LinkOptions = [() => __\u03A9ColorName, false, "color", "Whether to use colored text for the link.", '"cyan"', "stdout", "stderr", "target", 'The target for the link. Can be either "stdout" or "stderr".', '"stdout"', "url", "text", "", "fallback", "A fallback function to handle the link in environments that do not support it.", "LinkOptions", `PPn!."J4#8?$>%P.&.'J4(8?)>*P&2+&2,8&/-4.8?/Mw0y`];
function link(url, text2, options = {}) {
  if (!isHyperlinkSupported(options.target === "stderr" ? process.stderr : process.stdout)) {
    return options.fallback ? options.fallback(url, text2) : runtimeInfo.isColorSupported ? `${text2 ? `${text2} at ` : ""} ${colors.underline(options.color !== false ? getColor(options.color || "cyan")(url) : url)}` : `${text2 ? `${text2} at ` : ""} ${url}`;
  }
  return [
    "\x1B]",
    "8",
    ";",
    ";",
    url,
    "\x07",
    text2 || url,
    "\x1B]",
    "8",
    ";",
    ";",
    "\x07"
  ].join("");
}
__name(link, "link");
link.__type = ["url", "text", () => __\u03A9LinkOptions, "options", () => ({}), "link", "Create a link to a URL in the console.", `P&2!&2"8n#2$>%&/&?'`];
function stripAnsi(text2) {
  return text2.replace(new RegExp([
    String.raw`[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)`,
    String.raw`(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))`
  ].join("|"), "g"), "");
}
__name(stripAnsi, "stripAnsi");
stripAnsi.__type = ["text", "stripAnsi", 'P&2!"/"'];
function renderBanner(title, description) {
  const consoleWidth = Math.max(process.stdout.columns - 2, 46);
  const width = Math.max(Math.min(consoleWidth, Math.max(title.length + 2, 40)), 44);
  const banner = [];
  banner.push(colors.cyan(`\u250F\u2501\u2501\u2501\u2501 Examples CLI App CLI \u2501\u2501 v0.0.1 ${"\u2501".repeat(width - 10 - 25)}\u2513`));
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  banner.push(`${colors.cyan("\u2503")}${" ".repeat((width - title.length) / 2)}${colors.whiteBright(colors.bold(title))}${" ".repeat((width - title.length) / 2)}${colors.cyan("\u2503")}`);
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  banner.push(`${colors.cyan("\u2503")}${colors.dim(description.length < width - 2 ? `${" ".repeat((width - description.length) / 2)}${description}${" ".repeat((width - description.length) / 2)}` : description.split(" ").reduce(__assignType2((ret, word) => {
    const lines = ret.split("\n");
    if (lines.length > 1 && lines[lines.length - 1].length + word.length > width - 2) {
      ret += "\n";
    }
    ret += `${word} `;
    return ret;
  }, ["ret", "word", "", 'P"2!"2""/#']), "").trim())} ${colors.cyan("\u2503")}`);
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  banner.push(colors.cyan(`\u2517${"\u2501".repeat(width - 7 - 14)}\u2501 ${link("https://stormsoftware.com", "Storm Software")} \u2501\u2501\u2501\u2501\u251B`));
  return banner.map(__assignType2((line) => `${" ".repeat((consoleWidth - line.length) / 2)}${line}${" ".repeat((consoleWidth - line.length) / 2)}`, ["line", "", 'P"2!"/"'])).join("\n");
}
__name(renderBanner, "renderBanner");
renderBanner.__type = ["title", "description", "renderBanner", "Renders a CLI banner with the specified title.", 'P&2!&2"&/#?$'];
function renderFooter() {
  const consoleWidth = Math.max(process.stdout.columns - 2, 46);
  let supportRow = `You can reach out to the Storm Software - Support team via ${link("https://stormsoftware.com/support", "our website's support page")}.`;
  const supportRowLength = stripAnsi(supportRow).length;
  const footer = [];
  footer.push(`
  ${colors.bold("Links:")}`);
  footer.push(`    ${colors.bold("Homepage:       ")}${link("https://stormsoftware.com")}`);
  footer.push(`    ${colors.bold("Support:        ")}${link("https://stormsoftware.com/support")}`);
  footer.push(`    ${colors.bold("Contact:        ")}${link("https://stormsoftware.com/contact")}`);
  footer.push(`    ${colors.bold("Documentation:  ")}${link("https://stormsoftware.com/docs")}`);
  footer.push(`    ${colors.bold("Repository:     ")}${link("https://github.com/storm-software/storm-stack")}`);
  footer.push("\n");
  footer.push(`${" ".repeat((consoleWidth - 106) / 2)}Examples CLI App CLI is authored and maintained by ${link("https://stormsoftware.com", "Storm Software")}.${" ".repeat((consoleWidth - 106) / 2)}`);
  if (supportRow) {
    footer.push(`${" ".repeat((consoleWidth - supportRowLength) / 2)}${supportRow}${" ".repeat((consoleWidth - supportRowLength) / 2)}`);
  }
  return footer.join("\n");
}
__name(renderFooter, "renderFooter");
renderFooter.__type = ["renderFooter", "Renders a CLI footer with the application details", 'P&/!?"'];
var __\u03A9SelectOption = ["label", "value", "hint", "// Command-line prompt utilities", "SelectOption", 'P&4!&4"&4#8M?$w%y'];
var CANCEL_SYMBOL = Symbol.for("cancel");
var __\u03A9PromptCommonOptions = ["reject", "default", "undefined", "null", "symbol", "cancel", 'Specify how to handle a cancelled prompt (e.g. by pressing Ctrl+C).\n\nDefault strategy is `"default"`.\n\n- `"default"` - Resolve the promise with the `default` value or `initial` value.\n- `"undefined`" - Resolve the promise with `undefined`.\n- `"null"` - Resolve the promise with `null`.\n- `"symbol"` - Resolve the promise with a symbol `Symbol.for("cancel")`.\n- `"reject"`  - Reject the promise with an error.', "PromptCommonOptions", `PP.!.".#.$.%J4&8?'Mw(y`];
var __\u03A9TextPromptOptions = [() => __\u03A9PromptCommonOptions, "text", "type", "Specifies the prompt type as text.", '"text"', "default", "The default text value.", "placeholder", "A placeholder text displayed in the prompt.", "initial", "The initial text value.", "TextPromptOptions", `Pn!P."4#8?$>%&4&8?'&4(8?)&4*8?+MKw,y`];
var __\u03A9ConfirmPromptOptions = [() => __\u03A9PromptCommonOptions, "confirm", "type", "Specifies the prompt type as confirm.", "initial", "The initial value for the confirm prompt.", "ConfirmPromptOptions", `Pn!P."4#?$)4%8?&MKw'y`];
var __\u03A9SelectPromptOptions = [() => __\u03A9PromptCommonOptions, "select", "type", "Specifies the prompt type as select.", "initial", "The initial value for the select prompt.", () => __\u03A9SelectOption, "options", "The options to select from. See {@link SelectOption}.", "SelectPromptOptions", `Pn!P."4#?$&4%8?&P&n'JF4(?)MKw*y`];
var __\u03A9MultiSelectPromptOptions = [() => __\u03A9PromptCommonOptions, "multiselect", "type", "Specifies the prompt type as multiselect.", "initial", "The options to select from. See {@link SelectOption}.", () => __\u03A9SelectOption, "options", "required", "Whether the prompt requires at least one selection.", "MultiSelectPromptOptions", `Pn!P."4#?$&F4%8?&P&n'JF4(?&)4)8?*MKw+y`];
var __\u03A9PromptOptions = [() => __\u03A9TextPromptOptions, () => __\u03A9ConfirmPromptOptions, () => __\u03A9SelectPromptOptions, () => __\u03A9MultiSelectPromptOptions, "PromptOptions", 'Pn!n"n#n$Jw%y'];
var __\u03A9inferPromptReturnType = ["T", () => __\u03A9TextPromptOptions, () => __\u03A9ConfirmPromptOptions, () => __\u03A9SelectPromptOptions, "options", () => __\u03A9SelectOption, "options", "value", "options", () => __\u03A9MultiSelectPromptOptions, "options", "inferPromptReturnType", `l\x9E&R)Re&!.'f'f.(fRe&!.)f'fRPe%!.%f'fn&qk'3QRe$!.+fR#RPe#!n*qkMTQRPde%!pVRPe#!n$qk<bQRPde%!pjRPe#!n#qk%vQRPde%!p~RPe#!n"qk#\x8AQRb!Pde"!p\x92w,y`];
var __\u03A9inferPromptCancelReturnType = ["T", "reject", "cancel", "default", () => __\u03A9inferPromptReturnType, "undefined", "null", "symbol", () => CANCEL_SYMBOL, () => __\u03A9inferPromptReturnType, "inferPromptCancelReturnType", `l\xAA!Re$!o%"R-R,Ri)Re$!o*"RPe#!P.(4#Mqk03QRPde%!p:RPe#!P.'4#Mqk.JQRPde%!pRRPe#!P.&4#Mqk,bQRPde%!pjRPe#!P.$4#Mqk%zQRPde%!p\x82RPe#!P."4#Mqk#\x92QRb!Pde"!p\x9Aw+y`];
async function prompt(message, opts = {}) {
  const handleCancel = __assignType2((value) => {
    if (typeof value !== "symbol" || value.toString() !== "Symbol(clack:cancel)") {
      return value;
    }
    switch (opts.cancel) {
      case "reject": {
        const error = new StormError({ type: "general", code: 10 });
        error.name = "ConsolaPromptCancelledError";
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, prompt);
        }
        throw error;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "symbol": {
        return CANCEL_SYMBOL;
      }
      default:
      case void 0:
      case "default": {
        return opts.default ?? opts.initial;
      }
    }
  }, ["value", "", 'P#2!"/"']);
  if (!opts.type || opts.type === "text") {
    return await text({
      message,
      defaultValue: opts.default,
      placeholder: opts.placeholder,
      initialValue: opts.initial
    }).then(handleCancel);
  }
  if (opts.type === "confirm") {
    return await confirm({
      message,
      initialValue: opts.initial
    }).then(handleCancel);
  }
  if (opts.type === "select") {
    return await select({
      message,
      options: opts.options.map(__assignType2((o) => typeof o === "string" ? { value: o, label: o } : o, ["o", "", 'P"2!"/"'])),
      initialValue: opts.initial
    }).then(handleCancel);
  }
  if (opts.type === "multiselect") {
    return await multiselect({
      message,
      options: opts.options.map(__assignType2((o) => typeof o === "string" ? { value: o, label: o } : o, ["o", "", 'P"2!"/"'])),
      required: opts.required,
      initialValues: opts.initial
    }).then(handleCancel);
  }
  throw new StormError({
    type: "general",
    code: 16,
    params: [opts.type]
  });
}
__name(prompt, "prompt");
prompt.__type = ["message", () => __\u03A9PromptOptions, "opts", () => ({}), () => __\u03A9inferPromptReturnType, () => __\u03A9inferPromptCancelReturnType, "prompt", "Asynchronously prompts the user for input based on specified options.\nSupports text, confirm, select and multi-select prompts.", 'P&2!n"2#>$P"o%""o&"J`/\'?('];
function toArr(arr) {
  return arr == null ? [] : Array.isArray(arr) ? arr : [arr];
}
__name(toArr, "toArr");
toArr.__type = ["arr", "toArr", 'P"2!"/"'];
function toVal(out, key, val, opts) {
  let x;
  const old = out[key];
  const nxt = ~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : ~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
  out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
__name(toVal, "toVal");
toVal.__type = ["out", "key", "val", "opts", "toVal", 'P"2!&2""2#"2$"/%'];
function parseArgs(args, opts) {
  args = args || [];
  opts = opts || {};
  let k;
  let arr;
  let arg;
  let name;
  let val;
  const out = { _: [] };
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
      if (arg.charCodeAt(j) !== 45)
        break;
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
        if (arg.charCodeAt(idx) === 61)
          break;
      }
      name = arg.substring(j, idx);
      val = arg.substring(++idx) || i + 1 === len || `${args[i + 1]}`.charCodeAt(0) === 45 || args[++i];
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
__name(parseArgs, "parseArgs");
parseArgs.__type = ["args", "opts", "parseArgs", "// Parser is based on https://github.com/lukeed/mri", 'P"F2!"2""/#?$'];

// examples/cli-app/.storm/commands/vars/set/handle.ts
import { StormPayload } from "examples/cli-app/.storm/runtime/payload";
import { useStorm } from "examples/cli-app/.storm/runtime/context";
var __\u03A9VarsSetPayload = ["name", "The name of the variable to set in the variables store.", "value", "The value to set for the variable.", "VarsSetPayload", 'P&4!?""4#?$Mw%y'];
async function handler(payload) {
  const varsFile = await useStorm().storage.getItem(`vars:vars.json`);
  if (varsFile === void 0) {
    console.error(` ${colors.red("\u2716")} ${colors.redBright(`Variables file was not found`)}`);
    return;
  }
  const vars = (deserialize.\u03A9 = [["!"]], deserialize(varsFile));
  vars[payload.data.name] = payload.data.value;
  await useStorm().storage.setItem(`vars:vars.json`, serialize(vars));
  console.log("");
  console.log(colors.dim(" > `${payload.data.name}` variable set to ${payload.data.value}"));
  console.log("");
}
__name(handler, "handler");
handler.__type = [() => __\u03A9VarsSetPayload, () => StormPayload, "payload", "handler", "Sets a configuration parameter in the variables store.", 'PPn!7"2#"/$?%'];
var handle_default = handler;
export {
  __\u03A9VarsSetPayload,
  handle_default as default
};
