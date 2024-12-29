import { providerInfo } from "./providers";

/** Value of process.platform */
export const platform = globalThis.process?.platform || "";

/** Detect if `CI` environment variable is set or a provider CI detected */
export const isCI = Boolean(process.env.CI) || providerInfo.ci !== false;

/** Detect if stdout.TTY is available */
export const hasTTY = Boolean(
  globalThis.process?.stdout && globalThis.process?.stdout.isTTY
);

/** Detect if `DEBUG` environment variable is set */
export const isDebug = Boolean(process.env.DEBUG);

/** Detect if `NODE_ENV` environment variable is `test` */
export const isTest =
  process.env.NODE_ENV === "test" || Boolean(process.env.TEST);

/** Detect if `NODE_ENV` environment variable is `production` */
export const isProduction = process.env.NODE_ENV === "production";

/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
export const isDevelopment =
  process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development";

/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
export const isMinimal =
  Boolean(process.env.MINIMAL) || isCI || isTest || !hasTTY;

/** Detect if process.platform is Windows */
export const isWindows = /^win/i.test(platform);

/** Detect if process.platform is Linux */
export const isLinux = /^linux/i.test(platform);

/** Detect if process.platform is macOS (darwin kernel) */
export const isMacOS = /^darwin/i.test(platform);

/** Color Support */
export const isColorSupported =
  !Boolean(process.env.NO_COLOR) &&
  (Boolean(process.env.FORCE_COLOR) ||
    ((hasTTY || isWindows) && process.env.TERM !== "dumb") ||
    isCI);

/** Node.js versions */
export const nodeVersion =
  (globalThis.process?.versions?.node || "").replace(/^v/, "") || null;
export const nodeMajorVersion = Number(nodeVersion?.split(".")[0]) || null;
