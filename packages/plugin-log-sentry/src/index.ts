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

import { PluginOptions } from "@storm-stack/core/base/plugin";
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Context, EngineHooks } from "@storm-stack/core/types";
import type { LogPluginConfig } from "@storm-stack/devkit/plugins/log";
import LogPlugin from "@storm-stack/devkit/plugins/log";

export interface LogSentryPluginConfig extends LogPluginConfig {
  /**
   * The Sentry DSN to use for logging.
   *
   * @remarks
   * If not provided, the plugin will try to read the `SENTRY_DSN` environment variable.
   */
  sentryDsn: string;

  /**
   * The environment to use for logging.
   *
   * @remarks
   * If not provided, the plugin will try to read the `ENVIRONMENT` environment variable.
   */
  environment: string;
}

export default class LogSentryPlugin extends LogPlugin<LogSentryPluginConfig> {
  protected override installs = {
    "@sentry/core@^9.15.0": "dependency"
  } as Record<string, "dependency" | "devDependency">;

  public constructor(options: PluginOptions<LogSentryPluginConfig>) {
    super(options);
  }

  public override innerAddHooks(hooks: EngineHooks) {
    hooks.addHooks({
      "init:context": this.#initContext.bind(this)
    });

    super.innerAddHooks(hooks);
  }

  protected override writeSink(_context: Context) {
    return `${getFileHeader()}

import type { Client, ParameterizedString } from "@sentry/core";
import { getClient } from "@sentry/core";
import * as Sentry from "@sentry/node";
import type { LogRecord, LogSink } from "@storm-stack/types/log";

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
        JSON.stringify;

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
  dsn: $storm.config.SENTRY_DSN,
  environment: $storm.config.ENVIRONMENT,
  release: $storm.config.RELEASE_TAG,
  debug: !!$storm.config.DEBUG,
  enabled: true,
  attachStacktrace: !!$storm.config.STACKTRACE,
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
  async #initContext(context: Context) {
    context.installs["@sentry/core@^9.15.0"] = "dependency";

    if (context.options.platform === "node") {
      context.installs["@sentry/node@^9.15.0"] = "dependency";
    }
  }
}
