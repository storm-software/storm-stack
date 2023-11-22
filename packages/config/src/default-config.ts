import { deepCopy } from "@storm-software/utilities/helper-fns/deep-copy";
import { existsSync, readFileSync } from "fs";
import {
  buildProjectGraphWithoutDaemon,
  readProjectsConfigurationFromProjectGraph
} from "nx/src/project-graph/project-graph";
import { findWorkspaceRoot } from "nx/src/utils/find-workspace-root.js";
import { join } from "path";
import {
  ColorConfig,
  PackageConfigInput,
  ProjectConfigInput,
  StormConfigInput
} from "./types";
export { readProjectsConfigurationFromProjectGraph } from "@nx/devkit";

/**
 * Storm theme config values used for styling various workspace elements
 */
export const DefaultStormColorConfig: ColorConfig = {
  primary: "#1fb2a6",
  background: "#1d232a",
  success: "#087f5b",
  info: "#0ea5e9",
  warning: "#fcc419",
  error: "#990000",
  fatal: "#7d1a1a"
};

/**
 * Storm Workspace config values used during various dev-ops processes
 */
export const DefaultStormPackageConfig: Omit<PackageConfigInput, "name"> = {
  namespace: "storm-software",
  license: "Apache License 2.0",
  homepage: "https://stormsoftware.org",
  preMajor: false,
  owner: "@storm-software/development",
  worker: "stormie-bot",
  runtimeDirectory: "./node_modules/.storm",
  colors: deepCopy(DefaultStormColorConfig),
  modules: {}
};

/**
 * Storm Workspace config values used during various dev-ops processes
 */
export const DefaultStormProjectConfig: Omit<
  ProjectConfigInput,
  "name" | "root"
> = {
  ...deepCopy(DefaultStormPackageConfig),
  version: "0.0.1",
  tags: [],
  projectType: "library"
};

export const getDefaultConfig = async (): Promise<StormConfigInput> => {
  let name = "storm-workspace";
  let namespace = "storm-software";
  let repository = "https://github.com/storm-software/storm-stack";

  let license = DefaultStormPackageConfig.license;
  let homepage = DefaultStormPackageConfig.homepage;

  const workspaceRoot = findWorkspaceRoot(process.cwd())?.dir ?? process.cwd();
  if (existsSync(join(workspaceRoot, "package.json"))) {
    const file = readFileSync(join(workspaceRoot, "package.json"), {
      encoding: "utf-8"
    });
    if (file) {
      const packageJson = JSON.parse(file);

      packageJson.name && (name = packageJson.name);
      packageJson.namespace && (namespace = packageJson.namespace);
      packageJson.repository?.url && (repository = packageJson.repository?.url);
      packageJson.license && (license = packageJson.license);
      packageJson.homepage && (homepage = packageJson.homepage);
    }
  }

  const result: StormConfigInput = {
    ...deepCopy(DefaultStormPackageConfig),
    workspaceRoot,
    name,
    namespace,
    repository,
    license,
    homepage,
    runtimeVersion: "0.0.1",
    environment: "production",
    branch: "main",
    organization: "storm-software",
    projects: {},
    configFile: null
  };

  const projectGraph = await buildProjectGraphWithoutDaemon();
  const projectConfigs =
    readProjectsConfigurationFromProjectGraph(projectGraph);

  Object.keys(projectConfigs.projects).forEach((name: string) => {
    const projectConfig = projectConfigs.projects[name];
    if (projectConfig) {
      let projectNamespace = "storm-software";
      let projectVersion = DefaultStormProjectConfig.version;
      let projectLicense = license;
      let projectHomepage = homepage;

      if (existsSync(join(workspaceRoot, projectConfig.root, "package.json"))) {
        const file = readFileSync(
          join(workspaceRoot, projectConfig.root, "package.json"),
          {
            encoding: "utf-8"
          }
        );
        if (file) {
          const packageJson = JSON.parse(file);

          packageJson.version && (projectVersion = packageJson.version);
          packageJson.namespace && (projectNamespace = packageJson.namespace);
          packageJson.license && (projectLicense = packageJson.license);
          packageJson.homepage && (projectHomepage = packageJson.homepage);
        }
      }

      result.projects[name] = {
        ...deepCopy(DefaultStormProjectConfig),
        name,
        root: projectConfig.root,
        projectType: projectConfig.projectType
          ? projectConfig.projectType
          : "library",
        namespace: projectNamespace,
        version: projectVersion,
        license: projectLicense,
        homepage: projectHomepage,
        tags: projectConfig.tags ?? []
      };
    }
  });

  return result;
};
