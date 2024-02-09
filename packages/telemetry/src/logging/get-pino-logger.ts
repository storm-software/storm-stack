import type { StormConfig } from "@storm-software/config";
import { getPinoOptions } from "@storm-stack/logging";
import pino, {
  type DestinationStream,
  type LoggerOptions as PinoLoggerOptions,
  type Logger
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
  const baseOptions: PinoLoggerOptions = getPinoOptions(config, name, stacktrace);

  const prettyOptions: PrettyOptions = {
    destination: 1, // 1 = stdout
    colorize: true,
    colorizeObjects: true,
    errorLikeObjectKeys: ["err", "error", "exception"],
    minimumLevel: config.logLevel,
    messageKey: "msg",
    timestampKey: "time",
    messageFormat: `
***********************************************
Name: ${name ? name : config.name}
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
    prettyOptions.customColors = `exception:${config.colors.error},err:${config.colors.error},error:${config.colors.error},fatal:${config.colors.fatal},warn:${config.colors.warning},info:${config.colors.info},debug:${config.colors.primary},trace:${config.colors.primary},req.url:${config.colors.primary},success:${config.colors.success}`;
  }

  const streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> = [];
  if (extraStreams) {
    streams.push(...extraStreams);

    const multiStream = pino.multistream(streams, { dedupe: false });
    // multiStream.streams.map((s) => pinoPretty.pipe(s.stream));

    return pino(baseOptions, multiStream);
  }

  return pino(baseOptions);
};
