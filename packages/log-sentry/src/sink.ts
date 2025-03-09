/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { Client, ParameterizedString } from "@sentry/core";
import { getClient } from "@sentry/core";
import { StormJSON } from "@stryke/json/storm-json";
import type { LogRecord, LogSink } from "storm-stack/types";

function getParameterizedString(record: LogRecord): ParameterizedString {
  let result = "";
  let tplString = "";
  const tplValues: string[] = [];
  for (let i = 0; i < record.message.length; i++) {
    if (i % 2 === 0) {
      // eslint-disable-next-line ts/restrict-plus-operands
      result += record.message[i];
      tplString += String(record.message[i]).replaceAll("%", "%%");
    } else {
      // eslint-disable-next-line ts/no-use-before-define
      const value = inspect(record.message[i]);
      result += value;
      tplString += `%s`;
      tplValues.push(value);
    }
  }

  const paramStr = String(result) as ParameterizedString;
  paramStr.__sentry_template_string__ = tplString;
  paramStr.__sentry_template_values__ = tplValues;

  return result;
}

/**
 * A platform-specific inspect function. In Deno, this is {@link Deno.inspect}, and in Node.js/Bun it is {@link util.inspect}. If neither is available, it falls back to {@link StormJSON.stringify}.
 *
 * @param value The value to inspect.
 * @returns The string representation of the value.
 */
const inspect: (value: unknown) => string =
  // @ts-ignore: Deno global
  "Deno" in globalThis &&
  // @ts-ignore: Deno global
  // dnt-shim-ignore
  "inspect" in globalThis.Deno &&
  // @ts-ignore: Deno global
  typeof globalThis.Deno.inspect === "function"
    ? // @ts-ignore: Deno global
      globalThis.Deno.inspect
    : // @ts-ignore: Node.js global
      "util" in globalThis &&
        // @ts-ignore: Util global
        // dnt-shim-ignore
        "inspect" in globalThis.util &&
        // @ts-ignore: Node.js global
        globalThis.util.inspect === "function"
      ? // @ts-ignore: Node.js global
        globalThis.util.inspect
      : // eslint-disable-next-line ts/unbound-method
        StormJSON.stringify;

/**
 * Gets a LogTape sink that sends logs to Sentry.
 *
 * @see https://sentry.io/
 *
 * @param client The Sentry client. If omitted, the global default client is used.
 * @returns A LogTape sink that sends logs to Sentry.
 */
export function getSink(client?: Client): LogSink {
  return (record: LogRecord) => {
    if (client == null) {
      client = getClient();
    }

    if (record.level === "error" || record.level === "fatal") {
      client?.captureException(getParameterizedString(record), {
        data: record.properties
      });
    }

    client?.captureMessage(getParameterizedString(record), record.level, {
      data: record.properties
    });
  };
}
