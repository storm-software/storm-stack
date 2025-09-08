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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { EngineHooks } from "@storm-stack/core/types/build";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import LogPlugin from "@storm-stack/devkit/plugins/log";
import { LogSentryPluginContext, LogSentryPluginOptions } from "./types/plugin";

/**
 * A plugin for logging errors to Sentry.
 */
export default class LogSentryPlugin<
  TContext extends LogSentryPluginContext = LogSentryPluginContext
> extends LogPlugin<TContext, LogSentryPluginOptions> {
  /**
   * Creates an instance of the Sentry logging plugin.
   *
   * @param options - The plugin options.
   */
  public constructor(options: PluginOptions<LogSentryPluginOptions>) {
    super(options);

    this.dependencies = [["@storm-stack/plugin-config", options ?? {}]];
  }

  /**
   * Adds hooks to the Storm Stack engine for the Sentry plugin.
   *
   * @param hooks - The engine hooks to add
   */
  public override addHooks(hooks: EngineHooks<LogSentryPluginContext>) {
    hooks.addHooks({
      "init:options": this.#initOptions.bind(this),
      "init:install": this.#initInstall.bind(this)
      // "init:reflections": this.initReflections.bind(this)
    });

    super.addHooks(hooks);
  }

  /**
   * Initializes the options for the Sentry plugin.
   *
   * @param context - The context to initialize.
   */
  async #initOptions(context: TContext) {
    context.options.plugins.config.parsed.SENTRY_DSN ||=
      this.getOptions(context).dsn;
  }

  /**
   * Initializes the reflections for the Sentry plugin.
   *
   * @param context - The context to initialize.
   */
  // async initReflections(context: LogSentryPluginContext) {
  //   if (!context.reflections.config.types.params.hasProperty("SENTRY_DSN")) {
  //     context.reflections.config.types.params.addProperty({
  //       name: "SENTRY_DSN",
  //       optional: true,
  //       readonly: true,
  //       description: "The DSN for Sentry, used to send logs to Sentry.",
  //       visibility: ReflectionVisibility.public,
  //       type: {
  //         kind: ReflectionKind.string
  //       },
  //       default: context.options.plugins.config.parsed.SENTRY_DSN,
  //       tags: {
  //         domain: "logging",
  //         title: "Sentry DSN",
  //         readonly: true
  //       }
  //     });

  //     await writeConfigTypeReflection(
  //       context,
  //       context.reflections.config.types.params,
  //       "params"
  //     );
  //   }
  // }

  /**
   * Writes the adapter code for the Sentry plugin.
   *
   * @param context - The context to use for writing the adapter.
   * @returns The adapter code as a string.
   */
  protected override writeAdapter(context: TContext) {
    return `${getFileHeader()}

import type { ParameterizedString } from "@sentry/core";
import { getClient } from "@sentry/core";
import * as Sentry from "@sentry/node";
import { LogRecord, LogAdapter } from "@storm-stack/core/runtime-types/shared/log";

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

/**
 * Creates a new [Sentry](https://sentry.io/) logging adapter.
 *
 * @returns The created {@link LogAdapter}.
 */
function createAdapter(): LogAdapter {
  Sentry.init({
    dsn: $storm.config.SENTRY_DSN,
    environment: $storm.env.mode,
    release: $storm.config.RELEASE_TAG,
    debug: $storm.env.isDebug,
    enabled: ${
      this.getOptions(context).enabled === true ||
      context.options.mode !== "development"
        ? "true"
        : "false"
    },
    attachStacktrace: $storm.config.STACKTRACE,
    sendClientReports: true,
    sendDefaultPii: true
  });

  const client = getClient();
  const adapter = (record: LogRecord) => {
    const { level, properties } = record;

    if (client) {
      if (level === "error" || level === "fatal") {
        client.captureException(getParameterizedString(record), {
          data: properties
        });
      }

      client.captureMessage(getParameterizedString(record), level, {
        data: properties
      });
    }
  };
  adapter[Symbol.asyncDispose] = async () => {
    if (client) {
      await client.flush(2000);
      await client.close();
    }
  };

  return adapter;
}

export default createAdapter;

`;
  }

  /**
   * Initialize the context for the plugin.
   *
   * @param context - The context to initialize.
   */
  async #initInstall(context: LogSentryPluginContext) {
    context.packageDeps["@sentry/core@^9.15.0"] = "dependency";

    if (context.options.platform === "node") {
      context.packageDeps["@sentry/node@^9.15.0"] = "dependency";
    }
  }
}
