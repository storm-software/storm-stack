/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import type { StormConfig } from "@storm-software/config";
import { isStormError } from "@storm-stack/errors/storm-error";
import { titleCase } from "@storm-stack/string-fns/title-case";
import { isProduction } from "@storm-stack/utilities/helper-fns/is-production";
import { isRuntimeServer } from "@storm-stack/utilities/helper-fns/is-runtime-server";
import type { LoggerOptions as PinoLoggerOptions } from "pino";
import { LogLevel, getLogLevel } from "./get-log-level";
import { createErrorSerializer } from "./log-serializer";

/**
 * Get the Pino transports for the logger
 *
 * @param config - The workspace config
 * @param name - The name of the logger to get the options for
 * @returns The options for the logger
 */
export const getPinoOptions = (
  config: StormConfig,
  name?: string,
  stacktrace = false
): PinoLoggerOptions => {
  config.logLevel ??= config.env === "production" ? "info" : "debug";
  const _stacktrace =
    stacktrace || !(isProduction(config?.env) && !isRuntimeServer());
  const errorSerializer = createErrorSerializer(_stacktrace);

  const baseOptions: PinoLoggerOptions = {
    name: name || "Storm Software",
    enabled: getLogLevel(config.logLevel) > LogLevel.SILENT,
    level: config.logLevel,
    messageKey: "msg",
    errorKey: "error",
    redact: [
      "req.headers.authorization",
      "access_token",
      "data.access_token",
      "data.*.access_token",
      "data.*.accessToken",
      "accessToken",
      "data.accessToken",
      "DATABASE_URL",
      "data.*.email",
      "data.email",
      "email",
      "event.headers.authorization",
      "data.hashedPassword",
      "data.*.hashedPassword",
      "hashedPassword",
      "host",
      "jwt",
      "data.jwt",
      "data.*.jwt",
      "JWT",
      "data.JWT",
      "data.*.JWT",
      "password",
      "data.password",
      "data.*.password",
      "params",
      "data.salt",
      "data.*.salt",
      "salt",
      "secret",
      "data.secret",
      "data.*.secret"
    ],
    serializers: {
      exception: errorSerializer,
      err: errorSerializer,
      error: errorSerializer,
      fatal: errorSerializer
    },
    formatters: {
      level: (levelLabel: string, levelNumber: number) => ({
        logLevel: levelNumber,
        logLevelLabel: titleCase(levelLabel)
      }),
      log: (object: Record<string, unknown>) =>
        isStormError(object.err)
          ? { ...object, error: object.err }
          : isStormError(object.err)
            ? { ...object, error: object.err }
            : isStormError(object.exception)
              ? { ...object, error: object.exception }
              : object
    },
    browser: {
      disabled: getLogLevel(config.logLevel) === LogLevel.SILENT
    }
  };

  return baseOptions;
};
