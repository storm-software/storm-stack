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
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { CLIPluginConfig, CLIPluginContext } from "../types/config";

export function AppModule(context: CLIPluginContext, _config: CLIPluginConfig) {
  let support = context.options.support;
  if (!support) {
    if (isObject(context.packageJson?.bugs) && context.packageJson?.bugs?.url) {
      support = context.packageJson.bugs.url;
    }
  }

  return `${getFileHeader()}

import type {
  HandlerFunction,
  StormContext,
  StormRuntimeParams,
} from "@storm-stack/types/node";
import type {
  StormPayloadInterface
} from "@storm-stack/types/payload";
import type {
  StormResultInterface
} from "@storm-stack/types/result";
import { StormConfig, config } from "storm:config";
import {
  name,
  version,
  build,
  runtime,
  paths
} from "storm:env";
 import { STORM_ASYNC_CONTEXT } from "storm:context";
import { createStormError, StormError, isError } from "storm:error";
import { StormEvent } from "storm:event";
import { uniqueId } from "storm:id";
import { StormPayload } from "storm:payload";
import { StormResult } from "storm:result";
import { StormLog } from "storm:log";
import { storage } from "storm:storage";
import { link, colors } from "storm:cli";
import os from "node:os";
import { join } from "node:path";
import { spinner } from "@clack/prompts";

/**
 * Wrap an application entry point with the necessary context and error handling.
 *
 * @param handler - The handler function for the application.
 * @returns A function that takes an payload and returns a result or a promise of a result.
 */
export function withContext<TInput = any, TOutput = any>(
  handler: HandlerFunction<TInput, TOutput>
) {
  const disposables = new Set<Disposable>();
  const asyncDisposables = new Set<AsyncDisposable>();

  let isExitComplete = false;
  async function handleExit(): Promise<void> {
    if (isExitComplete) {
      return;
    }

    await storage.dispose();

    for (const disposable of disposables) {
      disposable[Symbol.dispose]();
    }
    disposables.clear();

    const promises = [] as PromiseLike<void>[];
    for (const disposable of asyncDisposables) {
      promises.push(disposable[Symbol.asyncDispose]());
      asyncDisposables.delete(disposable);
    }
    await Promise.all(promises);

    isExitComplete = true;
  }

  const log = new StormLog();
  for (const adapter of log.adapters()) {
    if (Symbol.asyncDispose in adapter) {
      asyncDisposables.add(adapter as AsyncDisposable);
    }
    if (Symbol.dispose in adapter) {
      disposables.add(adapter as Disposable);
    }
  }

  if ("process" in globalThis && !("Deno" in globalThis)) {
    // eslint-disable-next-line ts/no-misused-promises
    process.on("exit", handleExit);
  }

  return async function wrapper(input: TInput) {
    const payload = new StormPayload<TInput>(input);

    const context = {
      name,
      version,
      payload,
      meta: {},
      build,
      runtime,
      paths,
      log: log.with({ name, version, payloadId: payload.id }),
      storage,
      config,
      dotenv: {} as StormConfig, // This object is only used at compile time, so we can leave it empty here.
      emit: (_event: StormEvent) => {},
      __internal: {
        events: [] as StormEvent[]
      }
    } as StormContext<StormConfig>;

    function emit(event: StormEvent) {
      context.log.debug(
        \`The \${event.label} event was emitted by the application.\`,
        {
          event
        }
      );

      context.__internal.events.push(event);
    }
    context.emit = emit;

    async function handleShutdown(reason?: StormError) {
      try {
        if (isExitComplete) {
          return;
        }

        const s = spinner();
        s.start("Terminating the application. Please wait to ensure no data is lost...");

        if (reason) {
          context.log.fatal(reason, {
            name: context.name,
            version: context.build.version,
            build: context.build.buildId,
            release: context.build.releaseId,
            tag: context.build.releaseTag,
            mode: context.build.mode,
            os: JSON.stringify({ type: os.type(), release: os.release(), platform: os.platform() }),
          });

          await context.storage.setItem(\`crash-reports:${kebabCase(
            context.options.name
          )}-\${payload.id}.log\`, \`${titleCase(
            context.options.name
          )} - Crash Report

--------------------------------------

  \${reason.toDisplay()}

Application Name: \${context.name}
Application Version: \${context.version}
Timestamp: \${new Date().toISOString()}
Payload ID: \${payload.id}
Build: \${context.build.buildId}
Release: \${context.build.releaseId}
Tag: \${context.build.releaseTag}
Mode: \${context.build.mode}
Operating System: \${os.type()} \${os.release()} \${os.platform()}

--------------------------------------

This crash report was generated by the ${titleCase(
    context.options.name
  )} application. It contains information about the application and the environment it was running in at the time of the crash. The information in this report is used to help us improve the ${titleCase(
    context.options.name
  )} application and to provide support for any issues you may encounter. Please reach out to the ${titleCase(
    context.options?.organization &&
      (isSetString(context.options.organization) ||
        context.options.organization.name)
      ? isSetString(context.options.organization)
        ? context.options.organization
        : context.options.organization.name
      : context.options.name
  )} - Support team via ${
    support || context.options.contact
      ? `our website's ${support ? "support" : "contact"} page`
      : "our repository"
  } at: ${support || context.options.contact || context.options.repository}.
          \`);
        }

        await handleExit();

        s.stop("Completed terminating the application");
        console.log("");

        if (reason) {
          console.log(colors.dim(\`A crash report was generated \${link(\`file://\${join(paths.log, \`${kebabCase(
            context.options.name
          )}-\${payload.id}.log\`)}\`, "locally on your file system")}. Please include these details when reporting any issues with this software. ${
            support || context.options?.contact || context.options?.repository
              ? `You can reach out to the ${titleCase(
                  context.options?.organization &&
                    (isSetString(context.options.organization) ||
                      context.options.organization.name)
                    ? isSetString(context.options.organization)
                      ? context.options.organization
                      : context.options.organization.name
                    : context.options.name
                )} - Support team via \${link("${
                  support ||
                  context.options.contact ||
                  context.options.repository
                }", "${
                  support || context.options.contact
                    ? `our website's ${support ? "support" : "contact"} page`
                    : "our repository"
                }")}.`
              : ""
          } \`));
          console.log("");
        }

        process.exit(reason ? 1 : 0);
      } catch (err) {
        context.log.error("Shutdown process failed to complete", {
          reason,
          error: err
        });

        console.log("");
        console.error(\` \${colors.red("✘")} \${colors.white("The shutdown process failed to complete. Please check the application logs for more details.")}\`);
        console.log("");

        process.exit(1);
      }
    }

    for (const type of ["unhandledRejection", "uncaughtException"]) {
      process.on(type, err => {
        console.log("");
        console.error(\` \${colors.red("✘")} \${colors.white("A fatal error caused the application to crash ")}\`);
        console.log("");

        void handleShutdown(createStormError(err));
      });
    }

    for (const type of ["SIGTERM", "SIGINT", "SIGUSR2"]) {
      process.once(type, () => {
        console.log("");
        console.log(colors.dim(" > The application was terminated by the user "));
        console.log("");

        void handleShutdown();
      });
    }

    context.log.debug("Starting the application handler process.", {
      payload
    });

    const result = await STORM_ASYNC_CONTEXT.callAsync(
      context,
      async () => {
        try {
          const ret = await Promise.resolve(
            handler(payload)
          );
          if (isError(ret)) {
            context.log.error(ret);
            return StormResult.create(ret);
          }

          return StormResult.create(ret);
        } catch (err) {
          await handleShutdown(createStormError(err));
          return StormResult.create(err);
        }
      }
    );

    context.log.debug("The application handler process has completed.", {
      result
    });

    await handleShutdown();
  };
}
`;
}
