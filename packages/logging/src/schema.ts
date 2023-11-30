import * as z from "zod";

/**
 * Storm schema used to represent a the required config needed to use Loki
 */
export const LokiConfigSchema = z
  .object({
    host: z
      .string()
      .trim()
      .default("https://stormsoftware.grafana.net")
      .describe("The host of the Loki instance"),
    username: z
      .string()
      .trim()
      .describe("The username to use when authenticating with Loki"),
    password: z
      .string()
      .trim()
      .describe("The password to use when authenticating with Loki")
  })
  .describe(
    "Storm schema used to represent a the required config needed to use Loki"
  );

/**
 * Storm base schema used to represent a package's config (either workspace or project)
 */
export const LoggingConfigSchema = z
  .object({
    stacktrace: z
      .boolean()
      .optional()
      .describe(
        "An indicator specifying if stack traces should be logged on errors"
      ),
    fileName: z
      .string()
      .trim()
      .default("storm")
      .describe("The prefix to use for log files"),
    fileExtension: z
      .string()
      .trim()
      .default(".log")
      .describe("The prefix to use for log files"),
    path: z
      .string()
      .trim()
      .optional()
      .describe("The directory to write log files out to"),
    level: z
      .enum(["silent", "fatal", "error", "warn", "info", "debug", "trace"])
      .optional()
      .describe(
        "The log level used to filter out lower priority log messages. If not provided, this is defaulted using the `environment` config value (if `environment` is set to `production` then `level` is `error`, else `level` is `debug`)."
      ),
    loki: LokiConfigSchema.optional().describe("The Loki config to use")
  })
  .describe(
    "Storm base schema used to represent a package's config (either workspace or project) "
  );
