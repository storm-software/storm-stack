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

import { getFileHeader } from "../helpers/utilities/file-header";

export function writeError() {
  return `${getFileHeader()}

 import { StormJSON } from "@stryke/json/storm-json";
 import { StormURL } from "@stryke/url/storm-url";
 import type {
  ErrorMessageDetails,
  Indexable,
  MessageType
} from "@stryke/types";
 import { isError } from "@stryke/type-checks/is-error";
 import { isFunction } from "@stryke/type-checks/is-function";
 import { isObject } from "@stryke/type-checks/is-object";
 import { isSetString } from "@stryke/type-checks/is-set-string";
 import type {
   IStormError,
   ParsedStacktrace,
   StormErrorOptions
 } from "@storm-stack/types";
 import type { ErrorType } from "@storm-stack/types";

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
 export function getDefaultErrorNameFromErrorType(type: ErrorType): string {
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
  * Creates a new StormError instance
  *
  * @param cause - The cause of the error
  * @returns The newly created StormError
  */
 export function createStormError({
   code,
   name,
   type,
   cause,
   stack,
   data
 }: StormErrorOptions): StormError {
   if (isStormError(cause)) {
     return cause;
   }

   if (cause instanceof Error && cause.name === "StormError") {
     return cause as StormError;
   }

   const error = new StormError({
     name,
     type,
     code,
     cause,
     stack,
     data
   });

   // Inherit stack from error
   if (cause instanceof Error && cause.stack) {
     error.stack = cause.stack;
   }

   return error;
 }

 /**
  * Gets the cause of an unknown error and returns it as a StormError
  *
  * @param cause - The cause of the error in an unknown type
  * @returns The cause of the error in a StormError object or undefined
  */
 export function getErrorFromUnknown(
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
     return createStormError({
       code: getDefaultCode(type),
       name: cause.name,
       cause,
       stack: cause.stack,
       type,
       data
     });
   }

   const causeType = typeof cause;
   if (causeType === "undefined" || causeType === "function" || cause === null) {
     return new StormError({
       name: getDefaultErrorNameFromErrorType(type),
       code: getDefaultCode(type),
       cause,
       type,
       data
     });
   }

   // Primitive types just get wrapped in an error
   if (causeType !== "object") {
     return new StormError({
       name: getDefaultErrorNameFromErrorType(type),
       code: getDefaultCode(type),
       type,
       data
     });
   }

   // If it's an object, we'll create a synthetic error
   if (isObject(cause)) {
     const err = new StormError({
       name: getDefaultErrorNameFromErrorType(type),
       code: getDefaultCode(type),
       type,
       data
     });

     for (const key of Object.keys(cause)) {
       // eslint-disable-next-line ts/no-unsafe-assignment
       (err as Indexable)[key] = (cause as Indexable)[key];
     }

     return err;
   }

   return new StormError({
     name: getDefaultErrorNameFromErrorType(type),
     code: getDefaultCode(type),
     cause,
     type,
     data
   });
 }

 /**
  * Type-check to determine if \`obj\` is a \`StormError\` object
  *
  * @param value - the object to check
  * @returns The function isStormError is returning a boolean value.
  */
 export function isStormError(value: unknown): value is StormError {
   return (
     isError(value) &&
     isSetString((value as StormError)?.code) &&
     isSetString((value as StormError)?.type) &&
     isSetString((value as StormError)?.stack)
   );
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
       isSetString(optionsOrMessage) ? undefined : { cause: optionsOrMessage.cause }
     );

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
         // eslint-disable-next-line ts/unbound-method
       } else if (isFunction(Error.captureStackTrace)) {
         Error.captureStackTrace(this, this.constructor);
       } else {
         this.#stack = new Error("").stack;
       }

       this.name = optionsOrMessage.name || getDefaultErrorNameFromErrorType(this.type);
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
     this.#cause = getErrorFromUnknown(cause, this.type, this.data);
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
   public get originalStack(): string | undefined {
     return this.#stack;
   }

  /**
    * The unformatted stack trace
    *
    * @returns The stack trace string
    */
   public set originalStack(stack: string | undefined) {
     this.#stack = stack;
   }

  /**
   * A URL to a page that displays the error message details
   */
  public get url(): string {
    const url = new StormURL($storm.env.ERROR_URL!);
    url.paths.push(this.type.toLowerCase().replaceAll("_", "-"));
    url.paths.push(String(this.code));

    if (this.params.length > 0) {
      url.params.params = this.params;
    }

    return url.toEncoded();
  }

  /**
   * Prints the display error message string
   *
   * @param includeData - Whether to include the data in the error message
   * @returns The display error message string
   */
  public toDisplay(includeData = $storm.env.INCLUDE_ERROR_DATA): string {
    return \`\${this.name && this.name !== this.constructor.name ? (this.code ? \`\${this.name} \` : this.name) : ""} \${
      this.code
        ? this.code && this.name
          ? \`[\${this.type} - \${this.code}]\`
          : \`\${this.type} - \${this.code}\`
        : this.name
          ? \`[\${this.type}]\`
          : this.type
    }: Please review the details of this error at the following URL: \${this.url}\${
      includeData && this.data
        ? \`
Data: \${StormJSON.stringify(this.data)}\`
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
     stacktrace = $storm.env.STACKTRACE,
     includeData = $storm.env.INCLUDE_ERROR_DATA
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
