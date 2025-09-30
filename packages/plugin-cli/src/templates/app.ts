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
import { isString } from "@stryke/type-checks/is-string";
import type { CLIPluginContext } from "../types/plugin";

const CRASH_REPORT_DIVIDER_LENGTH = 42;

export function AppModule(context: CLIPluginContext) {
  let support = context.options.plugins.cli.support;
  if (!support) {
    if (isObject(context.packageJson?.bugs) && context.packageJson?.bugs?.url) {
      support = context.packageJson.bugs.url;
    }
  }

  const title = titleCase(context.options.name.replace(/-?cli$/i, ""));

  return `${getFileHeader()}

import type { HandlerFunction } from "@storm-stack/core/runtime-types/node/app";
import { StormResponse } from "storm:response";
import { StormRequest } from "storm:request";
import { format, formats } from "storm:date";
import { withContext, StormContext } from "storm:context";
import { createStormError, StormError, isError, isStormError } from "storm:error";
import { CLIRequestData, colors, link, showFatal, showError, showHelp } from "storm:cli";
import os from "node:os";
import { join } from "node:path";
import { spinner } from "@clack/prompts";

/**
 * Wrap an application entry point with the necessary context and error handling.
 *
 * @param handler - The handler function for the application.
 * @returns A function that takes an request and returns a response or a promise of a response.
 */
export function createCLIApp<TInput extends CLIRequestData = CLIRequestData, TOutput = any>(
  handler: HandlerFunction<TInput, TOutput>
): ((input: TInput) => Promise<StormResponse<StormError | unknown>>) {
  let isShutdown = false;
  return withContext(async (request: StormRequest<TInput>) => {
    async function handleShutdown(exception?: StormError | unknown) {
      try {
        if (isShutdown) {
          return;
        }

        isShutdown = true;
        console.log("");

        if (exception) {
          const error = isStormError(exception) ? exception : createStormError(exception);
          showFatal(\`The application crashed during processing.

\${error.toString()}

Additional details about this issue can be found in the crash report.\`);

          console.log("");
          console.log(\`\${colors.gray("A crash report was generated locally on your file system: ")}
\${link(\`file://\${join($storm.meta.paths.log, "crash-reports", \`${kebabCase(
    context.options.name
  )}-\${request.id}.log\`)}\`)}

\${colors.gray("Please include these report details when reporting any issues with this software. ")}\`);
          console.log("");

          ${
            support ||
            context.options.plugins.cli.contact ||
            context.options.workspaceConfig.repository
              ? `showHelp(\`You can reach out to the ${titleCase(
                  isString(context.options.plugins.cli.author)
                    ? context.options.plugins.cli.author
                    : context.options.plugins.cli.author?.name ||
                        context.options.name
                )} - Support team via ${
                  support || context.options.plugins.cli.contact
                    ? `our ${support ? "support" : "contact"} page`
                    : "our repository"
                } at \${link("${
                  support ||
                  context.options.plugins.cli.contact ||
                  context.options.workspaceConfig.repository
                }")}\${colors.white(".")}\`);`
              : ""
          }
        }

        const s = spinner();
        s.start("Shutting down the application. Please wait to ensure no data is lost...");

        if (exception) {
          const error = isStormError(exception) ? exception : createStormError(exception);
          $storm.log.fatal(error, {
            name: $storm.meta.name,
            version: $storm.meta.version,
            checksum: "${context.meta.checksum}",
            build: $storm.meta.buildId,
            release: $storm.meta.releaseId,
            tag: $storm.meta.releaseTag,
            mode: $storm.meta.mode,
            os: JSON.stringify({ type: os.type(), release: os.release(), platform: os.platform() }, null, 1),
          });

          await $storm.storage.setItem(\`crash-reports:${kebabCase(
            context.options.name
          )}_\${format(new Date(), "filePathDateTime")}.log\`, \`

${"-".repeat(
  Math.max((CRASH_REPORT_DIVIDER_LENGTH - (title.length + 17)) / 2, 3)
)} ${`${title} - Crash Report`}${"-".repeat(
    Math.max((CRASH_REPORT_DIVIDER_LENGTH - (title.length + 17)) / 2, 3)
  )}

Application Name: \${$storm.meta.name}
Application Version: \${$storm.meta.version}
Checksum: ${context.meta.checksum}
Crash Time: \${format(new Date(), "systemDateTime")}
Request ID: \${request.id}
Build: \${$storm.meta.buildId}
Release: \${$storm.meta.releaseId}
Tag: \${$storm.meta.releaseTag}
Mode: \${$storm.meta.mode}
Operating System: \${os.type()} \${os.release()} (\${os.platform()})

-------------- Error Details -------------

\${error.toString(true, true)}

------------------------------------------

This crash report was generated by the ${titleCase(
    context.options.name
  )} application. It contains information about the application and the environment it was running in at the time of the crash. The information in this report is used to help us improve the ${titleCase(
    context.options.name
  )} application and to provide support for any issues you may encounter. Please reach out to the ${titleCase(
    (isSetString(context.options.plugins.cli.author)
      ? context.options.plugins.cli.author
      : context.options.plugins.cli.author?.name) || context.options.name
  )} - Support team via ${
    support || context.options.plugins.cli.contact
      ? `our website's ${support ? "support" : "contact"} page`
      : "our repository"
  } at: ${support || context.options.plugins.cli.contact || context.options.workspaceConfig.repository}.

------------------------------------------
          \`);
        }

        for (const disposable of $storm.disposables) {
          disposable[Symbol.dispose]();
        }
        $storm.disposables.clear();

        const promises = [] as PromiseLike<void>[];
        for (const disposable of $storm.asyncDisposables) {
          promises.push(disposable[Symbol.asyncDispose]());
        }

        $storm.asyncDisposables.clear();
        await Promise.all(promises);

        s.stop("Completed shutting down the application");
        console.log("");

        return exception;
      } catch (ex) {
        const error = createStormError(ex);
        $storm.log.error("Shutdown process failed to complete", {
          exception,
          error
        });

        console.log("");
        showError(\`The shutdown process failed to complete - \${error.message}. Please check the application logs for more details.\`);
        console.log("");

        return error;
      }
    }

    try {
      if ("process" in globalThis && !("Deno" in globalThis)) {
        // eslint-disable-next-line ts/no-misused-promises
        process.on("exit", handleShutdown);
      }

      for (const type of ["unhandledRejection", "uncaughtException"]) {
        process.on(type, err => handleShutdown(err || new Error(\`An \${type === "unhandledRejection" ? "unhandled promise rejection" : "uncaught exception"} occurred during processing - the application is shutting down.\`)));
      }

      for (const type of ["SIGTERM", "SIGINT", "SIGUSR2"]) {
        process.once(type, () => {
          console.log("");
          console.log(colors.gray("> The application was terminated by the user"));
          console.log("");

          return handleShutdown();
        });
      }

      const ret = await Promise.resolve(
        handler(request)
      );
      if (isError(ret)) {
         $storm.log.error("An error occured while processing the command.", {
          request,
          error: ret
        });

        showError(createStormError(ret));
      }
    } catch (err) {
      return handleShutdown(err);
    }

    return handleShutdown();
  });
}
`;
}
