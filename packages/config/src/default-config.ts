import { deepCopy } from "@storm-software/utilities/helper-fns/deep-copy";
import { existsSync, readFileSync } from "fs";
import {
  buildProjectGraphWithoutDaemon,
  readProjectsConfigurationFromProjectGraph
} from "nx/src/project-graph/project-graph";
import { findWorkspaceRoot } from "nx/src/utils/find-workspace-root.js";
import { join } from "path";
import {
  PackageConfig,
  ProjectConfig,
  StormConfig,
  ThemeConfig
} from "./types";
export { readProjectsConfigurationFromProjectGraph } from "@nx/devkit";

/**
 * Storm theme config values used for styling various workspace elements
 */
export const DefaultStormThemeConfig: ThemeConfig = {
  colors: {
    primary: "#1fb2a6",
    background: "#1d232a",
    success: "#087f5b",
    info: "#0ea5e9",
    warning: "#fcc419",
    error: "#7d1a1a"
  }
};

/**
 * Storm Workspace config values used during various dev-ops processes
 */
export const DefaultStormPackageConfig: Omit<PackageConfig, "name" | "root"> = {
  namespace: "storm-software",
  version: "0.0.1",
  license: "Apache License 2.0",
  homepage: "https://stormsoftware.org",
  preMajor: false,
  owner: "sullivanpj",
  worker: "stormie-bot",
  runtimeDirectory: "./node_modules/.storm",
  theme: deepCopy(DefaultStormThemeConfig),
  environment: "development"
};

/**
 * Storm Workspace config values used during various dev-ops processes
 */
export const DefaultStormProjectConfig: Omit<ProjectConfig, "name" | "root"> = {
  ...deepCopy(DefaultStormPackageConfig),
  tags: [],
  projectType: "library"
};

export const getDefaultConfig = async (): Promise<StormConfig> => {
  let name = "storm-workspace";
  let namespace = "storm-software";
  let repository = "https://github.com/storm-software/storm-stack";

  let version = DefaultStormPackageConfig.version;
  let license = DefaultStormPackageConfig.license;
  let homepage = DefaultStormPackageConfig.homepage;

  const root = findWorkspaceRoot(process.cwd())?.dir ?? process.cwd();
  if (existsSync(join(root, "package.json"))) {
    const file = readFileSync(join(root, "package.json"), {
      encoding: "utf-8"
    });
    if (file) {
      const packageJson = JSON.parse(file);

      packageJson.name && (name = packageJson.name);
      packageJson.version && (version = packageJson.version);
      packageJson.namespace && (namespace = packageJson.namespace);
      packageJson.repository?.url && (repository = packageJson.repository?.url);
      packageJson.license && (license = packageJson.license);
      packageJson.homepage && (homepage = packageJson.homepage);
    }
  }

  const result: StormConfig = {
    version: "0.0.1",
    workspace: {
      ...deepCopy(DefaultStormPackageConfig),
      root,
      name,
      namespace,
      version,
      repository,
      license,
      homepage,
      branch: "main",
      preMajor: false,
      owner: "sullivanpj",
      worker: "stormie-bot",
      org: "storm-software",
      modules: {},
      projects: {}
    },
    configFilepath: null
  };

  const projectGraph = await buildProjectGraphWithoutDaemon();
  const projectConfigs =
    readProjectsConfigurationFromProjectGraph(projectGraph);

  Object.keys(projectConfigs.projects).forEach((name: string) => {
    const projectConfig = projectConfigs.projects[name];
    if (projectConfig) {
      let projectNamespace = "storm-software";
      let projectVersion = version;
      let projectLicense = license;
      let projectHomepage = homepage;

      if (existsSync(join(root, projectConfig.root, "package.json"))) {
        const file = readFileSync(
          join(root, projectConfig.root, "package.json"),
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

      result.workspace.projects[name] = {
        ...deepCopy(DefaultStormPackageConfig),
        name,
        root: projectConfig.root,
        projectType: projectConfig.projectType
          ? projectConfig.projectType
          : "library",
        namespace: projectNamespace,
        version: projectVersion,
        license: projectLicense,
        homepage: projectHomepage,
        preMajor: false,
        owner: "sullivanpj",
        worker: "stormie-bot",
        tags: projectConfig.tags ?? []
      };
    }
  });

  return result;
};
