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
export const TelemetryConfigSchema = z
  .object({
    stacktrace: z
      .boolean()
      .optional()
      .describe(
        "An indicator specifying if stack traces should be logged on errors"
      ),
    fileLoggingDisabled: z
      .boolean()
      .default(false)
      .describe("Should file logging be disabled"),
    fileName: z
      .string()
      .trim()
      .optional()
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
    loki: LokiConfigSchema.optional().describe("The Loki config to use")
  })
  .describe("Storm base telemetry configuration schema");
