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
import { getPinoOptions } from "@storm-stack/logging/utilities/get-pino-options";
import pino, {
  type DestinationStream,
  type Logger,
  type LoggerOptions as PinoLoggerOptions
} from "pino";
import pretty, { type PrettyOptions } from "pino-pretty";

export type LoggerOptions = {
  options: PinoLoggerOptions;
  stream?: DestinationStream;
};

/**
 * Get the Pino transports for the logger
 *
 * @param config - The workspace config
 * @param name - The name of the logger to get the options for
 * @returns The options for the logger
 */
export const getPinoLogger = (
  config: StormConfig,
  name?: string,
  extraStreams?: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[],
  stacktrace = true
): Logger<PinoLoggerOptions> => {
  const baseOptions: PinoLoggerOptions = getPinoOptions(
    config,
    name,
    stacktrace
  );

  const prettyOptions: PrettyOptions = {
    destination: 1, // 1 = stdout
    colorize: true,
    colorizeObjects: true,
    errorLikeObjectKeys: ["err", "error", "exception"],
    minimumLevel: config.logLevel
      ? config.logLevel === "silent"
        ? "fatal"
        : config.logLevel === "all"
          ? "trace"
          : config.logLevel
      : "info",
    messageKey: "msg",
    timestampKey: "time",
    messageFormat: `
***********************************************
Name: ${name || config.name}
Timestamp: {time}
Log Level: {logLevelLabel} {if pid}
Process ID: {pid}{end}{if req.url}
Request URL: {req.url}{end}
Message: {msg}
***********************************************
    `,
    singleLine: false,
    hideObject: false,
    sync: true
  };
  const pinoPretty = pretty(prettyOptions);
  pinoPretty.pipe(process.stdout);

  if (config.colors) {
    const colors =
      (config.colors as any)?.base?.dark ?? (config.colors as any)?.dark?.error;
    prettyOptions.customColors = `exception:${colors.fatal},err:${colors.error},error:${colors.error},fatal:${colors.fatal},warn:${colors.warning},info:${colors.info},debug:${colors.brand},trace:${colors.brand},req.url:${colors.brand},success:${colors.success}`;
  }

  const streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> =
    [];
  if (extraStreams) {
    streams.push(...extraStreams);

    const multiStream = pino.multistream(streams, { dedupe: false });
    // multiStream.streams.map((s) => pinoPretty.pipe(s.stream));

    return pino(baseOptions, multiStream);
  }

  return pino(baseOptions);
};
