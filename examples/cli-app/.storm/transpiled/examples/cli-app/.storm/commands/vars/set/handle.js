var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// examples/cli-app/.storm/commands/vars/set/handle.ts
import { deserialize, serialize } from "@deepkit/type";

// examples/cli-app/.storm/runtime/cli.ts
import { confirm, multiselect, select, text } from "@clack/prompts";

// examples/cli-app/.storm/runtime/env.ts
import os from "node:os";
import { basename, join } from "node:path";
var hasTTY = Boolean(process.stdout && process.stdout.isTTY);
var isCI = Boolean(process.env.STORM_CI || process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.RUN_ID || process.env.AGOLA_GIT_REF || process.env.AC_APPCIRCLE || process.env.APPVEYOR || process.env.CODEBUILD || process.env.TF_BUILD || process.env.bamboo_planKey || process.env.BITBUCKET_COMMIT || process.env.BITRISE_IO || process.env.BUDDY_WORKSPACE_ID || process.env.BUILDKITE || process.env.CIRCLECI || process.env.CIRRUS_CI || process.env.CF_BUILD_ID || process.env.CM_BUILD_ID || process.env.CI_NAME || process.env.DRONE || process.env.DSARI || process.env.EARTHLY_CI || process.env.EAS_BUILD || process.env.GERRIT_PROJECT || process.env.GITEA_ACTIONS || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI || process.env.GOCD || process.env.BUILDER_OUTPUT || process.env.HARNESS_BUILD_ID || process.env.JENKINS_URL || process.env.LAYERCI || process.env.MAGNUM || process.env.NETLIFY || process.env.NEVERCODE || process.env.PROW_JOB_ID || process.env.RELEASE_BUILD_ID || process.env.RENDER || process.env.SAILCI || process.env.HUDSON || process.env.SCREWDRIVER || process.env.SEMAPHORE || process.env.SOURCEHUT || process.env.STRIDER || process.env.TASK_ID || process.env.RUN_ID || process.env.TEAMCITY_VERSION || process.env.TRAVIS || process.env.VELA || process.env.NOW_BUILDER || process.env.APPCENTER_BUILD_ID || process.env.CI_XCODE_PROJECT || process.env.XCS || false);
var mode = "production";
var isProduction = ["prd", "prod", "production"].includes(mode.toLowerCase());
var isStaging = ["stg", "stage", "staging"].includes(mode.toLowerCase());
var isDevelopment = ["dev", "development"].includes(mode.toLowerCase());
var isDebug = isDevelopment && Boolean(process.env.DEBUG);
var isTest = isDevelopment || isStaging || ["tst", "test", "testing"].includes(mode.toLowerCase()) || Boolean(process.env.TEST);
var isMinimal = Boolean(process.env.MINIMAL) || isCI || isTest || !hasTTY;
var isWindows = /^win/i.test(process.platform);
var isLinux = /^linux/i.test(process.platform);
var isMacOS = /^darwin/i.test(process.platform);
var isInteractive = !isMinimal && Boolean(process.stdin?.isTTY && process.env.TERM !== "dumb");
var isUnicodeSupported = process.platform !== "win32" ? process.env.TERM !== "linux" : Boolean(process.env.WT_SESSION) || Boolean(process.env.TERMINUS_SUBLIME) || process.env.ConEmuTask === "{cmd::Cmder}" || process.env.TERM_PROGRAM === "Terminus-Sublime" || process.env.TERM_PROGRAM === "vscode" || process.env.TERM === "xterm-256color" || process.env.TERM === "alacritty" || process.env.TERM === "rxvt-unicode" || process.env.TERM === "rxvt-unicode-256color" || process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
var isColorSupported = !process.env.NO_COLOR && (Boolean(process.env.FORCE_COLOR) || (hasTTY || isWindows) && process.env.TERM !== "dumb");
var isNode = globalThis.process?.release?.name === "node";
var organization = "storm-software";
var appName = "examples-cli-app";
var homedir = os.homedir();
var tmpdir = os.tmpdir();
var paths = isMacOS ? {
  data: process.env.STORM_DATA_DIR ? join(process.env.STORM_DATA_DIR, appName) : join(homedir, "Library", "Application Support", organization, appName),
  config: process.env.STORM_CONFIG_DIR ? join(process.env.STORM_CONFIG_DIR, appName) : join(homedir, "Library", "Preferences", organization, appName),
  cache: process.env.STORM_CACHE_DIR ? join(process.env.STORM_CACHE_DIR, appName) : join(homedir, "Library", "Caches", organization, appName),
  log: process.env.STORM_LOG_DIR ? join(process.env.STORM_LOG_DIR, appName) : join(homedir, "Library", "Logs", organization, appName),
  temp: process.env.STORM_TEMP_DIR ? join(process.env.STORM_TEMP_DIR, appName) : join(tmpdir, organization, appName)
} : isWindows ? {
  data: process.env.STORM_DATA_DIR ? join(process.env.STORM_DATA_DIR, appName) : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "StormSoftware", "ExamplesCLIApp", "Data"),
  config: process.env.STORM_CONFIG_DIR ? join(process.env.STORM_CONFIG_DIR, appName) : join(process.env.APPDATA || join(homedir, "AppData", "Roaming"), "StormSoftware", "ExamplesCLIApp", "Config"),
  cache: process.env.STORM_CACHE_DIR ? join(process.env.STORM_CACHE_DIR, appName) : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "Cache", "StormSoftware"),
  log: process.env.STORM_LOG_DIR ? join(process.env.STORM_LOG_DIR, appName) : join(process.env.LOCALAPPDATA || join(homedir, "AppData", "Local"), "StormSoftware", "ExamplesCLIApp", "Log"),
  temp: process.env.STORM_TEMP_DIR ? join(process.env.STORM_TEMP_DIR, appName) : join(tmpdir, "StormSoftware", "ExamplesCLIApp")
} : {
  data: process.env.STORM_DATA_DIR ? join(process.env.STORM_DATA_DIR, appName) : join(process.env.XDG_DATA_HOME || join(homedir, ".local", "share"), organization, appName),
  config: process.env.STORM_CONFIG_DIR ? join(process.env.STORM_CONFIG_DIR, appName) : join(process.env.XDG_CONFIG_HOME || join(homedir, ".config"), organization, appName),
  cache: process.env.STORM_CACHE_DIR ? join(process.env.STORM_CACHE_DIR, appName) : join(process.env.XDG_CACHE_HOME || join(homedir, ".cache"), organization, appName),
  log: join(process.env.XDG_STATE_HOME || join(homedir, ".local", "state"), organization, appName),
  temp: process.env.STORM_TEMP_DIR ? join(process.env.STORM_TEMP_DIR, appName) : process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR ? join(process.env.DEVENV_RUNTIME || process.env.XDG_RUNTIME_DIR, organization, appName) : join(tmpdir, basename(homedir), organization, appName)
};
var build = {
  packageName: "@storm-stack/examples-cli-app",
  organization,
  buildId: "DrZaJhkS-xzGmbONz4rPXV4V",
  timestamp: 1748233881407 ? Number(1748233881407) : 0,
  releaseId: "X6Y0A_nxbf7KhxwXNRixbphR",
  releaseTag: "examples-cli-app@0.0.1",
  mode,
  platform: "node",
  isProduction,
  isStaging,
  isDevelopment
};
var runtime = {
  isTest,
  isDebug,
  isNode,
  hasTTY,
  isWindows,
  isLinux,
  isMacOS,
  isCI,
  isInteractive,
  isMinimal,
  isColorSupported,
  isUnicodeSupported,
  isServer: isNode || build.platform === "node"
};

// packages/types/src/shared/error.ts
var __\u03A9Error = ["name", "message", "stack", "Error", 'P&4!&4"&4#8Mw$y'];
var __\u03A9ErrorType = ["general", "not_found", "validation", "service_unavailable", "action_unsupported", "security", "unknown", "ErrorType", `P.!.".#.$.%.&.'Jw(y`];
var __\u03A9StormErrorOptions = ["name", "The error name.", "code", "The error code", "params", "The error message parameters.", "cause", "The error cause.", "stack", "The error stack.", () => __\u03A9ErrorType, "type", "The type of error.", '"exception"', "data", "Additional data to be included with the error.", "Interface representing the Storm error options.", "StormErrorOptions", `P&4!8?"'4#?$&F4%8?&#4'8?(&4)8?*n+4,8?->."4/8?0M?1w2y`];
var __\u03A9ParsedStacktrace = ["column", "function", "line", "source", "ParsedStacktrace", `P'4!8&4"8'4#8&4$Mw%y`];
var __\u03A9IStormError = [() => __\u03A9Error, "code", "The error code", "params", "The error message parameters", () => __\u03A9ErrorType, "type", "The type of error that was thrown.", "url", "A url to display the error message", "data", "Additional data to be passed with the error", 0, "cause", "The underlying cause of the error, if any. This is typically another error object that caused this error to be thrown.", "stack", "The error stack", () => __\u03A9ParsedStacktrace, "stacktrace", "The parsed stacktrace", "originalStack", "The original stacktrace", "", "toDisplay", "Returns a formatted error string that can be displayed to the user.", "__proto__", "Internal function to inherit the error", "The Storm Error interface.", "IStormError", `Pn!'4"?#&F4$?%n&4'?(&4)?*"4+8?,Pn--J4.?/&40?1n2F43?4&45?6P&/748?9"4:?;M?<w=y`];

// examples/cli-app/.storm/runtime/error.ts
function __assignType(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType, "__assignType");
function getDefaultCode(_type) {
  return 1;
}
__name(getDefaultCode, "getDefaultCode");
getDefaultCode.__type = [() => __\u03A9ErrorType, "_type", "getDefaultCode", "Get the default error code for the given error type.", `Pn!2"'/#?$`];
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
getDefaultErrorName.__type = [() => __\u03A9ErrorType, "type", "getDefaultErrorName", "Get the default error name for the given error type.", 'Pn!2"&/#?$'];
function isError(value) {
  if (!value || typeof value !== "object" && value?.constructor !== Object) {
    return false;
  }
  return Object.prototype.toString.call(value) === "[object Error]" || Object.prototype.toString.call(value) === "[object DOMException]" || typeof value?.message === "string" && typeof value?.name === "string";
}
__name(isError, "isError");
isError.__type = ["value", "isError", "Checks if `value` is an {@link Error}, `EvalError`, `RangeError`, `ReferenceError`,\n`SyntaxError`, `TypeError`, or `URIError` object.", 'P#2!!/"?#'];
function isStormError(value) {
  return isError(value) && value?.code !== void 0 && typeof value?.code === "number" && value?.type !== void 0 && typeof value?.type === "string";
}
__name(isStormError, "isStormError");
isStormError.__type = ["value", "isStormError", "Type-check to determine if `value` is a {@link StormError} object", 'P#2!!/"?#'];
function createStormError(cause, type = "general", data) {
  if (isStormError(cause)) {
    const result = cause;
    result.data ??= data;
    return result;
  }
  if (isError(cause)) {
    return new StormError2({
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
    return new StormError2({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      cause,
      type,
      data
    });
  }
  if (causeType !== "object") {
    return new StormError2({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      type,
      data
    });
  }
  if (cause && (causeType === "object" || cause?.constructor === Object)) {
    const err = new StormError2({
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
  return new StormError2({
    name: getDefaultErrorName(type),
    code: getDefaultCode(type),
    cause,
    type,
    data
  });
}
__name(createStormError, "createStormError");
createStormError.__type = ["cause", () => __\u03A9ErrorType, "type", () => "general", "data", () => StormError2, "createStormError", "Creates a new {@link StormError} instance from an unknown cause value", `P#2!n"2#>$"2%8P7&/'?(`];
var StormError2 = class _StormError extends Error {
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
    super("An error occurred during processing", typeof optionsOrMessage === "string" && optionsOrMessage ? void 0 : { cause: optionsOrMessage.cause });
    if (typeof optionsOrMessage === "string" && optionsOrMessage) {
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
      } else if (Error.captureStackTrace instanceof Function || typeof Error.captureStackTrace === "function" || Boolean(Error.captureStackTrace?.constructor && Error.captureStackTrace?.call && Error.captureStackTrace?.apply)) {
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
    const url = new URL("https://developer.stormsoftware.com/api/errors");
    url.pathname = `${this.type.toLowerCase().replaceAll("_", "-")}/${String(this.code)}`;
    if (this.params.length > 0) {
      url.pathname += `/${this.params.map(__assignType((param) => encodeURI("" + param).replaceAll(/%7c/gi, "|").replaceAll("#", "%23").replaceAll("?", "%3F").replaceAll(/%252f/gi, "%2F").replaceAll("&", "%26").replaceAll("+", "%2B").replaceAll("/", "%2F"), ["param", "", 'P"2!"/"'])).join("/")}`;
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
    return `${this.name && this.name !== this.constructor.name ? this.code ? `${this.name} ` : this.name : ""}${this.code ? this.code && this.name ? `[${this.type.toUpperCase()}-${this.code}]` : `${this.type.toUpperCase()}-${this.code}` : this.name ? `[${this.type.toUpperCase()}]` : this.type.toUpperCase()}: Please review the details of this error at the following URL: ${this.url}${includeData && this.data ? `
Related details: ${JSON.stringify(this.data)}` : ""}${this.cause.name ? `
Inner Error: ${this.cause.name}${this.cause.message ? " - " + this.cause.message : ""}` : ""}`;
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
  }, "#stack", "The stack trace", () => __\u03A9IStormError, "#cause", "The inner error", "code", "The error code", "params", function() {
    return [];
  }, "The error message parameters", () => __\u03A9ErrorType, "type", function() {
    return "general";
  }, "The type of error event", "data", "Additional data to be passed with the error", () => __\u03A9StormErrorOptions, "optionsOrMessage", () => __\u03A9ErrorType, () => "general", "constructor", "The StormError constructor", "includeData", "toDisplay", "Prints the display error message string", "stacktrace", "toString", "Prints the error message and stack trace", () => __\u03A9IStormError, "StormError", "A wrapper around the base JavaScript Error class to be used in Storm Stack applications", `P7!!3">#&3$8?%n&3'8?('3)?*!3+>,?-n.3/>0?1"328?3PPn4&J25n62/>7"08?9!!!!!P"2:&0;?<P"2="2:&0>??5n@x"wA?B`];
};

// examples/cli-app/.storm/runtime/cli.ts
function __assignType2(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType2, "__assignType");
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
var colors = isColorSupported ? colorDefs : Object.fromEntries(Object.keys(colorDefs).map(__assignType2((key) => [key, String], ["key", "", 'P"2!"/"'])));
function getColor(color, fallback = "reset") {
  return colors[color] || colors[fallback];
}
__name(getColor, "getColor");
getColor.__type = [() => __\u03A9ColorName, "color", () => __\u03A9ColorName, "fallback", () => "reset", "text", "", "getColor", "Gets a color function by name, with an option for a fallback color if the requested color is not found.", `Pn!2"n#2$>%PP&'J2&&/'/(?)`];
var __\u03A9LinkOptions = [() => __\u03A9ColorName, false, "color", "Whether to use colored text for the link.", '"blueBright"', "stdout", "stderr", "target", 'The target for the link. Can be either "stdout" or "stderr".', '"stdout"', "url", "text", "", "fallback", "A fallback function to handle the link in environments that do not support it.", "LinkOptions", `PPn!."J4#8?$>%P.&.'J4(8?)>*P&2+&2,8&/-4.8?/Mw0y`];
function parseVersion(versionString = "") {
  if (/^d{3,4}$/.test(versionString)) {
    const match = /(d{1,2})(d{2})/.exec(versionString) ?? [];
    return {
      major: 0,
      minor: Number.parseInt(match[1], 10),
      patch: Number.parseInt(match[2], 10)
    };
  }
  const versions = (versionString ?? "").split(".").map(__assignType2((n) => Number.parseInt(n, 10), ["n", "", 'P"2!"/"']));
  return {
    major: versions[0],
    minor: versions[1],
    patch: versions[2]
  };
}
__name(parseVersion, "parseVersion");
parseVersion.__type = ["versionString", "parseVersion", 'P"2!"/"'];
function isHyperlinkSupported(stream = process.stdout) {
  if (process.env.FORCE_HYPERLINK) {
    return !(process.env.FORCE_HYPERLINK.length > 0 && Number.parseInt(process.env.FORCE_HYPERLINK, 10) === 0);
  }
  if (process.env.NETLIFY) {
    return true;
  } else if (!isColorSupported || hasTTY) {
    return false;
  } else if ("WT_SESSION" in process.env) {
    return true;
  } else if (process.platform === "win32" || isMinimal || process.env.TEAMCITY_VERSION) {
    return false;
  } else if (process.env.TERM_PROGRAM) {
    const version = parseVersion(process.env.TERM_PROGRAM_VERSION);
    switch (process.env.TERM_PROGRAM) {
      case "iTerm.app": {
        if (version.major === 3) {
          return version.minor !== void 0 && version.minor >= 1;
        }
        return version.major !== void 0 && version.major > 3;
      }
      case "WezTerm": {
        return version.major !== void 0 && version.major >= 20200620;
      }
      case "vscode": {
        if (process.env.CURSOR_TRACE_ID) {
          return true;
        }
        return version.minor !== void 0 && version.major !== void 0 && (version.major > 1 || version.major === 1 && version.minor >= 72);
      }
      case "ghostty": {
        return true;
      }
    }
  }
  if (process.env.VTE_VERSION) {
    if (process.env.VTE_VERSION === "0.50.0") {
      return false;
    }
    const version = parseVersion(process.env.VTE_VERSION);
    return version.major !== void 0 && version.major > 0 || version.minor !== void 0 && version.minor >= 50;
  }
  if (process.env.TERM === "alacritty") {
    return true;
  }
  return false;
}
__name(isHyperlinkSupported, "isHyperlinkSupported");
isHyperlinkSupported.__type = ["stream", () => process.stdout, "isHyperlinkSupported", "Check if the current environment supports hyperlinks in the terminal.", 'P!2!>")/#?$'];
function link(url, text2, options = {}) {
  if (!isHyperlinkSupported(options.target === "stderr" ? process.stderr : process.stdout)) {
    return options.fallback ? options.fallback(url, text2) : isColorSupported ? `${text2 && text2 !== url ? `${text2} at ` : ""} ${colors.underline(options.color !== false ? getColor(options.color || "blueBright")(url) : url)}` : `${text2 && text2 !== url ? `${text2} at ` : ""} ${url}`;
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
  const consoleWidth = Math.max(process.stdout.columns - 2, 80);
  const width = Math.max(Math.min(consoleWidth, Math.max(title.length + 2, 70)), 70);
  const banner = [];
  banner.push(colors.cyan(`\u250F\u2501\u2501\u2501\u2501 Examples CLI App CLI \u2501 v0.0.1 ${"\u2501".repeat(width - 10 - 25)}\u2513`));
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  banner.push(`${colors.cyan("\u2503")}${" ".repeat((width - title.length) / 2)}${colors.whiteBright(colors.bold(title))}${" ".repeat((width - title.length) / 2)}${colors.cyan("\u2503")}`);
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  const text2 = description.length < width * 0.9 ? `${" ".repeat((width - description.length) / 2)}${description}${" ".repeat((width - description.length) / 2)}` : description.split(" ").reduce(__assignType2((ret, word) => {
    const lines = ret.split("\n");
    if (lines.length !== 0 && lines[lines.length - 1].length + word.length > width * 0.9) {
      ret += "\n";
    }
    ret += `${word} `;
    return ret;
  }, ["ret", "word", "", 'P"2!"2""/#']), "");
  for (const line of text2.split("\n")) {
    banner.push(`${colors.cyan("\u2503")}${" ".repeat((width - line.length) / 2)}${colors.gray(line)}${" ".repeat((width - line.length) / 2)}${colors.cyan("\u2503")}`);
  }
  banner.push(colors.cyan(`\u2503${" ".repeat(width)}\u2503`));
  banner.push(colors.cyan(`\u2517${"\u2501".repeat(width - 7 - 14)}\u2501 Storm Software \u2501\u2501\u2501\u2501\u251B`));
  return banner.map(__assignType2((line) => `${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}${line}${" ".repeat((consoleWidth - stripAnsi(line).length) / 2)}`, ["line", "", 'P"2!"/"'])).join("\n");
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
        const error = new StormError2({ type: "general", code: 10 });
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
  throw new StormError2({
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

// packages/types/src/shared/payload.ts
var __\u03A9IStormPayload = ["TData", "timestamp", "The timestamp of the payload.", "id", "The unique identifier for the payload.", "data", "The data of the payload.", "IStormPayload", `"c!P'4"?#&4$?%e"!4&?'Mw(y`];

// examples/cli-app/.storm/runtime/id.ts
function __assignType3(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType3, "__assignType");
function getRandom(array) {
  if (array === null) {
    throw new StormError({ code: 9 });
  }
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}
__name(getRandom, "getRandom");
getRandom.__type = ["array", "getRandom", "Generate a random string", 'PW2!"/"?#'];
function uniqueId(size = 24) {
  const randomBytes = getRandom(new Uint8Array(size));
  return randomBytes.reduce(__assignType3((id, byte) => {
    byte &= 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += "-";
    } else {
      id += "_";
    }
    return id;
  }, ["id", "byte", "", 'P"2!"2""/#']), "");
}
__name(uniqueId, "uniqueId");
uniqueId.__type = ["size", "uniqueId", "A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.", 'P"2!&/"?#'];

// examples/cli-app/.storm/runtime/payload.ts
var StormPayload = class {
  static {
    __name(this, "StormPayload");
  }
  /**
   * The data associated with the payload.
   */
  data;
  /**
   * The payload identifier.
   */
  id = uniqueId();
  /**
   * The payload created timestamp.
   */
  timestamp = Date.now();
  /**
   * Create a new payload object.
   *
   * @param data - The payload data.
   */
  constructor(data) {
    this.data = data;
  }
  static __type = ["TData", "data", "The data associated with the payload.", "id", function() {
    return uniqueId();
  }, "The payload identifier.", "timestamp", function() {
    return Date.now();
  }, "The payload created timestamp.", "constructor", "Create a new payload object.", () => __\u03A9IStormPayload, "StormPayload", "A base payload class used by the Storm Stack runtime.", `"c!e!!3"9?#!3$9>%?&!3'9>(?)Pe"!2""0*?+5e!!o,"x"w-?.`];
};

// examples/cli-app/.storm/runtime/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
var STORM_CONTEXT_KEY = "storm-stack";
var STORM_ASYNC_CONTEXT = (getContext.\u03A9 = [["StormContext", '"w!']], getContext(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
}));
function useStorm() {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError2({ type: "general", code: 12 });
  }
}
__name(useStorm, "useStorm");
useStorm.__type = ["StormContext", "useStorm", "Get the Storm context for the current application.", 'P"w!/"?#'];

// examples/cli-app/.storm/commands/vars/set/handle.ts
var __\u03A9VarsSetPayload = ["name", "The name of the variable to set in the variables store.", "value", "The value to set for the variable.", "VarsSetPayload", 'P&4!?""4#?$Mw%y'];
async function handler(payload) {
  const varsFile = await useStorm().storage.getItem(`vars:vars.json`);
  if (varsFile === void 0) {
    console.error(` ${colors.red("\u2716")} ${colors.redBright(`Variables file was not found`)}`);
    return;
  }
  const vars = (deserialize.\u03A9 = [["!"]], deserialize(varsFile));
  vars[payload.data.name] = payload.data.value;
  await useStorm().storage.setItem(`vars:vars.json`, (serialize.\u03A9 = [["!"]], serialize(vars)));
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
