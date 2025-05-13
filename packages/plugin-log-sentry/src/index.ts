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

import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import type { LogPluginConfig } from "@storm-stack/devkit/plugins/log";
import LogPlugin from "@storm-stack/devkit/plugins/log";

export default class LogSentryPlugin<
  TOptions extends Options = Options
> extends LogPlugin<TOptions> {
  protected override dependencies: string[] = ["@sentry/core@^9.15.0"];

  public constructor(config: LogPluginConfig) {
    super(config, "log-sentry-plugin", "@storm-stack/plugin-log-sentry");
  }

  public override addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.#initContext.bind(this)
    });

    super.addHooks(hooks);
  }

  protected override writeSink(_context: Context<TOptions>) {
    return `${getFileHeader()}

import type { Client, ParameterizedString } from "@sentry/core";
import { getClient } from "@sentry/core";
import * as Sentry from "@sentry/node";
import type { LogRecord, LogSink } from "@storm-stack/types/log";
import { StormJSON } from "@stryke/json/storm-json";

/**
 * A platform-specific inspect function. In Deno, this is {@link Deno.inspect}, and in Node.js/Bun it is {@link util.inspect}. If neither is available, it falls back to {@link StormJSON.stringify}.
 *
 * @param value - The value to inspect.
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
      tplString += \` %
      s\`;
      tplValues.push(value);
    }
  }

  const paramStr = String(result) as ParameterizedString;
  paramStr.__sentry_template_string__ = tplString;
  paramStr.__sentry_template_values__ = tplValues;

  return result;
}

Sentry.init({
  dsn: $storm.vars.SENTRY_DSN,
  environment: $storm.vars.ENVIRONMENT,
  release: $storm.vars.RELEASE_TAG,
  debug: !!$storm.vars.DEBUG,
  enabled: true,
  attachStacktrace: !!$storm.vars.STACKTRACE,
  sendClientReports: true
});

const client = getClient();

const sink = (record: LogRecord) => {
  if (record.level === "error" || record.level === "fatal") {
    client?.captureException(getParameterizedString(record), {
      data: record.properties
    });
  }

  client?.captureMessage(getParameterizedString(record), record.level, {
    data: record.properties
  });
};

export default sink;
`;
  }

  /**
   * Initialize the context for the plugin.
   *
   * @param context - The context to initialize.
   */
  async #initContext(context: Context<TOptions>) {
    if (context.options.platform === "node") {
      context.installs["@sentry/node@^9.15.0"] = "dependency";
    }
  }
}
