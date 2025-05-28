var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// examples/cli-app/src/types.ts
var __\u03A9AddPayload = ["file", "The file to add to the file system.", '"server.ts"', "type", "The type of the file.", '"server"', "AddPayload", `P&4!?">#&4$?%>&Mw'y`];

// examples/cli-app/.storm/runtime/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";

// packages/types/src/shared/error.ts
var __\u03A9Error = ["name", "message", "stack", "Error", 'P&4!&4"&4#8Mw$y'];
var __\u03A9ErrorType = ["general", "not_found", "validation", "service_unavailable", "action_unsupported", "security", "unknown", "ErrorType", `P.!.".#.$.%.&.'Jw(y`];
var __\u03A9StormErrorOptions = ["name", "The error name.", "code", "The error code", "params", "The error message parameters.", "cause", "The error cause.", "stack", "The error stack.", () => __\u03A9ErrorType, "type", "The type of error.", '"exception"', "data", "Additional data to be included with the error.", "Interface representing the Storm error options.", "StormErrorOptions", `P&4!8?"'4#?$&F4%8?&#4'8?(&4)8?*n+4,8?->."4/8?0M?1w2y`];
var __\u03A9ParsedStacktrace = ["column", "function", "line", "source", "ParsedStacktrace", `P'4!8&4"8'4#8&4$Mw%y`];
var __\u03A9IStormError = [() => __\u03A9Error, "code", "The error code", "params", "The error message parameters", () => __\u03A9ErrorType, "type", "The type of error that was thrown.", "url", "A url to display the error message", "data", "Additional data to be passed with the error", 0, "cause", "The underlying cause of the error, if any. This is typically another error object that caused this error to be thrown.", "stack", "The error stack", () => __\u03A9ParsedStacktrace, "stacktrace", "The parsed stacktrace", "originalStack", "The original stacktrace", "", "toDisplay", "Returns a formatted error string that can be displayed to the user.", "__proto__", "Internal function to inherit the error", { internal: true }, "The Storm Error interface.", "IStormError", `Pn!'4"?#&F4$?%n&4'?(&4)?*"4+8?,Pn--J4.?/&40?1n2F43?4&45?6P&/748?9"4:?;z<M?=w>y`];

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
  if (cause && (causeType === "object" || cause?.constructor === Object)) {
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
createStormError.__type = ["cause", () => __\u03A9ErrorType, "type", () => "general", "data", () => StormError, "createStormError", "Creates a new {@link StormError} instance from an unknown cause value", `P#2!n"2#>$"2%8P7&/'?(`];
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
    super("An error occurred during processing", typeof optionsOrMessage === "string" ? void 0 : { cause: optionsOrMessage?.cause });
    if (typeof optionsOrMessage === "string") {
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
    const url = new URL("https://development.stormsoftware.com/api/errors");
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
Related details: ${JSON.stringify(this.data)}` : ""}${this.cause?.name ? `
Inner Error: ${this.cause?.name}${this.cause?.message ? " - " + this.cause?.message : ""}` : ""}`;
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

// examples/cli-app/.storm/runtime/context.ts
var STORM_CONTEXT_KEY = "storm-stack";
var STORM_ASYNC_CONTEXT = (getContext.\u03A9 = [["StormContext", '"w!']], getContext(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
}));
function useStorm() {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}
__name(useStorm, "useStorm");
useStorm.__type = ["StormContext", "useStorm", "Get the Storm context for the current application.", 'P"w!/"?#'];

// packages/types/src/shared/payload.ts
var __\u03A9IStormPayload = ["TData", "timestamp", "The timestamp of the payload.", "id", "The unique identifier for the payload.", "data", "The data of the payload.", "IStormPayload", `"c!P'4"?#&4$?%e"!4&?'Mw(y`];

// examples/cli-app/.storm/runtime/id.ts
function __assignType2(fn, args) {
  fn.__type = args;
  return fn;
}
__name(__assignType2, "__assignType");
function getRandom(array) {
  if (array === null) {
    throw new StormError({ type: "general", code: 9 });
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
  return randomBytes.reduce(__assignType2((id, byte) => {
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

// examples/cli-app/src/commands/add/index.ts
function handler(event) {
  const payload = event.data;
  useStorm().log.info(`Adding ${payload.type} to file system on ${payload.file}`);
}
__name(handler, "handler");
handler.__type = [() => __\u03A9AddPayload, () => StormPayload, "event", "handler", "Add an item to the file system", 'PPn!7"2#"/$?%'];
var index_default = handler;
export {
  index_default as default
};
