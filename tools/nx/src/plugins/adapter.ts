/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { CreateNodesResultV2, CreateNodesV2 } from "@nx/devkit";
import { createNodesFromFiles, readJsonFile } from "@nx/devkit";
import { joinPaths } from "@storm-software/eslint/utils/correct-paths";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot
} from "@storm-software/workspace-tools/utils/plugin-helpers";
import { setDefaultProjectTags } from "@storm-software/workspace-tools/utils/project-tags";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";
import { StormStackProjectTagScopeValue } from "../types";
import { addProjectScopeTag } from "../utilities/project-tags";

/* eslint-disable no-console */

export const name = "storm-stack/adapter";

export interface StormStackAdapterPluginOptions {}

export const createNodesV2: CreateNodesV2<StormStackAdapterPluginOptions> = [
  "packages/*/project.json",
  async (configFiles, options, context): Promise<CreateNodesResultV2> => {
    return createNodesFromFiles(
      (configFile, options, context) => {
        try {
          console.log(
            `[storm-stack/adapter]: Processing project.json file: ${configFile}`
          );

          const projectRoot = getProjectRoot(configFile, context.workspaceRoot);
          if (!projectRoot) {
            console.error(
              `[storm-stack/adapter]: project.json file must be located in the project root directory: ${configFile}`
            );
            return {};
          }

          const packageJson = readJsonFile<PackageJson>(
            joinPaths(projectRoot, "package.json")
          );
          if (!packageJson) {
            console.error(
              `[storm-stack/adapter]: No package.json found in project root: ${projectRoot}`
            );
            return {};
          }

          const project = getProjectConfigFromProjectRoot(
            projectRoot,
            packageJson
          );
          if (!project) {
            console.error(
              `No project configuration found in project root: ${projectRoot}`
            );
            return {};
          }
          if (
            !project.tags?.some(tag =>
              tag?.toLowerCase()?.startsWith("adapter:")
            )
          ) {
            return {};
          }

          const tsconfigJson = readJsonFile<TsConfigJson>(
            joinPaths(projectRoot, "tsconfig.json")
          );
          if (!tsconfigJson) {
            console.error(
              `[storm-stack/adapter]: No tsconfig.json found in project root: ${projectRoot}`
            );
            return {};
          }

          const targets: ProjectConfiguration["targets"] =
            readTargetsFromPackageJson(
              packageJson as PackageJsonNx,
              readNxJson(context.workspaceRoot),
              projectRoot,
              context.workspaceRoot
            );

          let relativeRoot = projectRoot
            .replaceAll("\\", "/")
            .replace(context.workspaceRoot.replaceAll("\\", "/"), "");
          if (relativeRoot.startsWith("/")) {
            relativeRoot = relativeRoot.slice(1);
          }

          targets.clean = {
            executor: "@storm-stack/nx:clean",
            defaultConfiguration: "production",
            options: {
              outputPath: "{workspaceRoot}/dist/{projectRoot}",
              plugins: ["@storm-stack/plugin-node"],
              skipInstalls: true
            },
            configurations: {
              production: {
                mode: "production"
              },
              development: {
                mode: "development"
              }
            }
          };

          targets.prepare = {
            cache: true,
            inputs: ["typescript", "^production"],
            outputs: ["{projectRoot}/.storm"],
            executor: "@storm-stack/nx:prepare",
            dependsOn: ["clean", "^build"],
            defaultConfiguration: "production",
            options: {
              outputPath: "{workspaceRoot}/dist/{projectRoot}",
              plugins: ["@storm-stack/plugin-node"],
              skipInstalls: true
            },
            configurations: {
              production: {
                mode: "production"
              },
              development: {
                mode: "development"
              }
            }
          };

          targets.build = {
            cache: true,
            inputs: ["typescript", "^production"],
            outputs: ["{options.outputPath}"],
            executor: "@storm-stack/nx:build",
            dependsOn: ["clean", "^build"],
            defaultConfiguration: "production",
            options: {
              outputPath: "{workspaceRoot}/dist/{projectRoot}",
              plugins: ["@storm-stack/plugin-node"],
              skipInstalls: true
            },
            configurations: {
              production: {
                mode: "production"
              },
              development: {
                mode: "development"
              }
            }
          };

          setDefaultProjectTags(project, name);
          addProjectScopeTag(project, StormStackProjectTagScopeValue.ADAPTER);

          const implicitDependencies = project.implicitDependencies ?? [];
          if (!implicitDependencies.includes("types")) {
            implicitDependencies.push("types");
          }
          if (!implicitDependencies.includes("core")) {
            implicitDependencies.push("core");
          }
          if (!implicitDependencies.includes("plugin-node")) {
            implicitDependencies.push("plugin-node");
          }

          if (project?.name) {
            console.log(
              `[storm-stack/adapter]: Inferred Nx configuration for ${project.name}`
            );
          }

          return project?.name
            ? {
                projects: {
                  [project.name]: {
                    ...project,
                    root: relativeRoot,
                    targets,
                    implicitDependencies
                  }
                }
              }
            : {};
        } catch (error_) {
          console.error(`[storm-stack/adapter]: ${JSON.stringify(error_)}`);
          return {};
        }
      },
      configFiles,
      options ?? {},
      context
    );
  }
];
