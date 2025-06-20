/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "../../../helpers/utilities/file-header";

export function writeError() {
  return `
/**
 * The Storm Stack error module provides a custom error class and utility functions to support error handling
 *
 * @module storm:error
 */

${getFileHeader()}

import {
  ErrorType,
  IStormError,
  ParsedStacktrace,
  StormErrorOptions
} from "@storm-stack/types/error";
 import {
  ErrorMessageDetails,
  MessageType
} from "@storm-stack/types/message";

/**
* Get the default error code for the given error type.
*
* @param _type - The error type.
* @returns The default error code.
*/
export function getDefaultCode(_type: ErrorType): number {
  return 1;
}

/**
* Get the default error name for the given error type.
*
* @param type - The error type.
* @returns The default error name.
*/
export function getDefaultErrorName(type: ErrorType): string {
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

/**
 * Checks if \`value\` is an {@link Error}, \`EvalError\`, \`RangeError\`, \`ReferenceError\`,
 * \`SyntaxError\`, \`TypeError\`, or \`URIError\` object.
 *
 * @example
 * \`\`\`typescript
 * isError(new Error)
 * // => true
 *
 * isError(Error)
 * // => false
 * \`\`\`
 *
 * @param value - The value to check.
 * @returns Returns \`true\` if \`value\` is an error object, else \`false\`.
 */
export function isError(value: unknown): value is Error {
  if (!value || (typeof value !== "object" && value?.constructor !== Object)) {
    return false;
  }

  return (
    Object.prototype.toString.call(value) === "[object Error]" ||
    Object.prototype.toString.call(value) === "[object DOMException]" ||
    (typeof (value as Error)?.message === "string" &&
      typeof (value as Error)?.name === "string")
  );
};

/**
 * Type-check to determine if \`value\` is a {@link StormError} object
 *
 * @param value - the object to check
 * @returns Returns \`true\` if \`value\` is a {@link StormError} object, else \`false\`.
 */
export function isStormError(value: unknown): value is StormError {
  return (
    isError(value) &&
    (value as StormError)?.code !== undefined &&
    typeof ((value as StormError)?.code) === "number" &&
    (value as StormError)?.type !== undefined &&
    typeof ((value as StormError)?.type) === "string"
  );
}

 /**
  * Creates a new {@link StormError} instance from an unknown cause value
  *
  * @param cause - The cause of the error in an unknown type
  * @param type - The type of the error
  * @param data - Additional data to be passed with the error
  * @returns The cause of the error in a {@link StormError} object
  */
export function createStormError(
  cause: unknown,
  type: ErrorType = "general",
  data?: any
): StormError {
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

  // Primitive types just get wrapped in an error
  if (causeType !== "object") {
    return new StormError({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      type,
      data
    });
  }

  // If it's an object, we'll create a synthetic error
  if (cause && (causeType === "object" || cause?.constructor === Object)) {
    const err = new StormError({
      name: getDefaultErrorName(type),
      code: getDefaultCode(type),
      type,
      data
    });

    for (const key of Object.keys(cause)) {
      // eslint-disable-next-line ts/no-unsafe-assignment
      (err as Record<string, any>)[key] = (cause as Record<string, any>)[key];
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

 /**
  * A wrapper around the base JavaScript Error class to be used in Storm Stack applications
  */
 export class StormError extends Error implements IStormError {
   __proto__ = Error;

   /**
    * The stack trace
    */
   #stack?: string;

   /**
    * The inner error
    */
   #cause?: IStormError;

   /**
    * The error code
    */
   public code: number;

   /**
    * The error message parameters
    */
   public params = [] as string[];

   /**
    * The type of error event
    */
   public type: ErrorType = "general";

   /**
    * Additional data to be passed with the error
    */
   public data?: any;

  /**
   * The StormError constructor
   *
   * @param options - The options for the error
   * @param type - The type of error
   */
  public constructor(
    optionsOrMessage: StormErrorOptions | string,
    type: ErrorType = "general"
  ) {
    super(
       "An error occurred during processing",
       typeof optionsOrMessage === "string" ? undefined : { cause: optionsOrMessage?.cause }
     );

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
         // eslint-disable-next-line ts/unbound-method
       } else if (
         Error.captureStackTrace instanceof Function ||
         typeof Error.captureStackTrace === "function" ||
         Boolean(
           Error.captureStackTrace?.constructor && (Error.captureStackTrace as any)?.call && (Error.captureStackTrace as any)?.apply
         )
       ) {
         Error.captureStackTrace(this, this.constructor);
       } else {
         this.#stack = new Error("").stack;
       }

       this.name = optionsOrMessage.name || getDefaultErrorName(this.type);
       this.data = optionsOrMessage.data;
       this.cause ??= optionsOrMessage.cause;
     }

     Object.setPrototypeOf(this, StormError.prototype);
   }

   /**
    * The cause of the error
    */
   public override get cause(): IStormError | undefined {
     return this.#cause;
   }

   /**
    * The cause of the error
    */
   public override set cause(cause: unknown) {
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
   public get stacktrace(): ParsedStacktrace[] {
     const stacktrace: ParsedStacktrace[] = [];
     if (this.#stack) {
       for (const line of this.#stack.split("\\n")) {
         const parsed =
           /^\\s+at (?:(?<function>[^)]+) \\()?(?<source>[^)]+)\\)?$/u.exec(line)
             ?.groups as
             | Partial<Record<keyof ParsedStacktrace, string>>
             | undefined;
         if (!parsed) {
           continue;
         }

         if (!parsed.source) {
           continue;
         }

         const parsedSource =
           /^(?<source>.+):(?<line>\\d+):(?<column>\\d+)$/u.exec(
             parsed.source
           )?.groups;
         if (parsedSource) {
           Object.assign(parsed, parsedSource);
         }

         if (
           /^[/\\\\](?![/\\\\])|^[/\\\\]{2}(?!\\.)|^[a-z]:[/\\\\]/i.test(parsed.source)
         ) {
           parsed.source = \`file://\${parsed.source}\`;
         }

         if (parsed.source === import.meta.url) {
           continue;
         }

         for (const key of ["line", "column"] as const) {
           if (parsed[key]) {
             parsed[key] = Number(parsed[key]).toString();
           }
         }

         stacktrace.push(parsed as ParsedStacktrace);
       }
     }

     return stacktrace;
   }

   /**
    * Prints a displayable/formatted stack trace
    *
    * @returns The stack trace string
    */
   public override get stack(): string {
     return this.stacktrace
       .filter(Boolean)
       .map(line => {
         return \`    at \${line.function} (\${line.source}:\${line.line}:\${line.column})\`;
       })
       .join("\\n");
   }

   /**
    * Store the stack trace
    */
   public override set stack(stack: string) {
     this.#stack = stack;
   }


  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  public get originalStack(): string {
    return this.#stack || "";
  }

  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  public set originalStack(stack: string) {
    this.#stack = stack;
  }

  /**
   * A URL to a page that displays the error message details
   */
  public get url(): string {
    const url = new URL($storm.config.ERROR_URL!);
    url.pathname = \`\${this.type.toLowerCase().replaceAll("_", "-")}/\${String(this.code)}\`;

    if (this.params.length > 0) {
      url.pathname += \`/\${this.params.map(param => encodeURI("" + param)
        .replaceAll(/%7c/gi, "|")
        .replaceAll("#", "%23")
        .replaceAll("?", "%3F")
        .replaceAll(/%252f/gi, "%2F")
        .replaceAll("&", "%26")
        .replaceAll("+", "%2B")
        .replaceAll("/", "%2F")
      ).join("/")}\`;
    }

    return url.toString();
  }

  /**
   * Prints the display error message string
   *
   * @param includeData - Whether to include the data in the error message
   * @returns The display error message string
   */
  public toDisplay(includeData = $storm.config.INCLUDE_ERROR_DATA): string {
    return \`\${this.name && this.name !== this.constructor.name ? (this.code ? \`\${this.name} \` : this.name) : ""}\${
      this.code
        ? this.code && this.name
          ? \`[\${this.type.toUpperCase()}-\${this.code}]\`
          : \`\${this.type.toUpperCase()}-\${this.code}\`
        : this.name
          ? \`[\${this.type.toUpperCase()}]\`
          : this.type.toUpperCase()
    }: Please review the details of this error at the following URL: \${this.url}\${
      includeData && this.data
        ? \`
Related details: \${JSON.stringify(this.data)}\`
        : ""
    }\${
      this.cause?.name
        ? \`
Inner Error: \${this.cause?.name}\${this.cause?.message ? " - " + this.cause?.message : ""}\`
        : ""
    }\`;
  }

   /**
    * Prints the error message and stack trace
    *
    * @param stacktrace - Whether to include the stack trace in the error message
    * @param includeData - Whether to include the data in the error message
    * @returns The error message and stack trace string
    */
   public override toString(
     stacktrace = $storm.config.STACKTRACE,
     includeData = $storm.config.INCLUDE_ERROR_DATA
   ): string {
     return (
       this.toDisplay(includeData) +
       (stacktrace
         ? ""
         : \` \nStack Trace: \n\${this.stack}\`)
     );
   }
 }

   `;
}
