import * as z from "zod";

/**
 * Storm theme color config values used for styling various workspace elements
 */
export const ColorConfigSchema = z
  .object({
    primary: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#0ea5e9")
      .describe("The primary color of the workspace"),
    background: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#1d232a")
      .describe("The background color of the workspace"),
    success: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#087f5b")
      .describe("The success color of the workspace"),
    info: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#0ea5e9")
      .describe("The informational color of the workspace"),
    warning: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#fcc419")
      .describe("The warning color of the workspace"),
    error: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#990000")
      .describe("The error color of the workspace"),
    fatal: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^#([0-9a-f]{3}){1,2}$/i)
      .length(7)
      .default("#7d1a1a")
      .describe("The fatal color of the workspace")
  })
  .describe("Colors used for various workspace elements");

/**
 * Storm base schema used to represent a package's config (either workspace or project)
 */
export const PackageConfigSchema = z
  .object({
    name: z.string().trim().toLowerCase().describe("The name of the package"),
    namespace: z
      .string()
      .trim()
      .toLowerCase()
      .default("storm-software")
      .describe("The namespace of the package"),
    license: z
      .string()
      .trim()
      .default("Apache License 2.0")
      .describe("The root directory of the package"),
    homepage: z
      .string()
      .trim()
      .url()
      .default("https://stormsoftware.org")
      .describe("The homepage of the workspace"),
    preMajor: z
      .boolean()
      .default(false)
      .describe(
        "An indicator specifying if the package is still in it's pre-major version"
      ),
    owner: z.string().trim().describe("The owner of the package"),
    worker: z
      .string()
      .trim()
      .default("stormie-bot")
      .describe(
        "The worker of the package (this is the bot that will be used to perform various tasks)"
      ),
    runtimeDirectory: z
      .string()
      .trim()
      .default("./node_modules/.storm")
      .describe("The runtime directory of Storm"),
    fileBanner: z
      .string()
      .trim()
      .default(
        "This code was developed by Storm Software (https://stormsoftware.org) and is licensed under the Apache License 2.0."
      )
      .describe(
        "A banner added to the top of each source file in the package once published"
      ),
    colors: ColorConfigSchema.describe(
      "Storm theme config values used for styling various package elements"
    )
  })
  .describe(
    "Storm base schema used to represent a package's config (either workspace or project) "
  );

/**
 * Storm project schema used to represent a project's config
 */
export const ProjectConfigSchema = PackageConfigSchema.extend({
  root: z.string().trim().describe("The root directory of the project"),
  version: z
    .string()
    .trim()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    )
    .default("0.0.1")
    .describe("The version of the workspace"),
  projectType: z
    .enum(["application", "library"])
    .default("library")
    .describe("The type of project"),
  tags: z
    .array(z.string().trim().toLowerCase())
    .default([])
    .describe("Various config tags associated with the repository"),
  modules: z.record(z.any()).describe("Configuration of each used extension")
}).describe("Storm Project-level config");

/**
 * Storm theme color config values used for styling various workspace elements
 */
export const WorkspaceSchema = z
  .object({
    env: z
      .enum(["development", "staging", "production"])
      .default("development")
      .describe("The current runtime environment of the package"),
    ci: z
      .boolean()
      .default(false)
      .describe(
        "An indicator specifying if the current environment is a CI environment"
      ),
    repository: z
      .string()
      .trim()
      .url()
      .describe("The repo URL of the workspace (i.e. GitHub)"),
    workspaceRoot: z
      .string()
      .trim()
      .describe("The root directory of the workspace"),
    branch: z
      .string()
      .trim()
      .default("main")
      .describe("The branch of the workspace"),
    organization: z
      .string()
      .trim()
      .default("storm-software")
      .describe("The organization of the workspace"),
    timezone: z
      .string()
      .trim()
      .default("America/New_York")
      .describe("The default timezone of the workspace"),
    locale: z
      .string()
      .trim()
      .default("en-US")
      .describe("The default locale of the workspace")
  })
  .describe("Colors used for various workspace elements");

const ConfigFileWorkspaceSchema = WorkspaceSchema.extend({
  projects: z
    .record(ProjectConfigSchema.describe("Config for a specific Storm project"))
    .describe("Config for each Storm project")
}).describe(
  "The values set in the Storm config file. This file is expected to be named `storm.config.js` and be located in the root of the workspace"
);

/**
 * Full Storm config file values used during various dev-ops processes
 */
export const ConfigFileSchema = PackageConfigSchema.merge(
  ConfigFileWorkspaceSchema
).describe(
  "The values set in the Storm config file. This file is expected to be named `storm.config.js` and be located in the root of the workspace"
);

const StormConfigWorkspaceSchema = WorkspaceSchema.extend({
  configFile: z
    .string()
    .trim()
    .nullable()
    .default(null)
    .describe(
      "The filepath of the Storm config. When this field is null, no config file was found in the current workspace."
    ),
  runtimeVersion: z
    .string()
    .trim()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    )
    .default("0.0.1")
    .describe("The global version of the Storm runtime"),
  modules: z.record(z.any()).describe("Configuration of each used extension")
}).describe(
  "The values set in the Storm config file. This file is expected to be named `storm.config.js` and be located in the root of the workspace"
);

/**
 * Full Storm Workspace config values used during various dev-ops processes
 */
export const StormConfigSchema = ProjectConfigSchema.merge(
  StormConfigWorkspaceSchema
).describe(
  "Storm Workspace config values used during various dev-ops processes. This type is a combination of the StormPackageConfig and StormProject types. It represents the config of the entire monorepo."
);
