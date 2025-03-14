/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { CreateNodesResultV2, CreateNodesV2 } from "@nx/devkit";
import { createNodesFromFiles, readJsonFile } from "@nx/devkit";
import { joinPaths } from "@storm-software/config-tools/utilities/correct-paths";
import type { ProjectTagVariant } from "@storm-software/workspace-tools";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot
} from "@storm-software/workspace-tools/utils/plugin-helpers";
import {
  addProjectTag,
  setDefaultProjectTags
} from "@storm-software/workspace-tools/utils/project-tags";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";

/* eslint-disable no-console */

export const name = "storm-stack/nx/plugin";

export interface StormStackNxPluginOptions {}

export const createNodesV2: CreateNodesV2<StormStackNxPluginOptions> = [
  "packages/*/project.json",
  async (configFiles, options, context): Promise<CreateNodesResultV2> => {
    return createNodesFromFiles(
      (configFile, options, context) => {
        try {
          console.log(`Processing project.json file: ${configFile}`);

          const projectRoot = getProjectRoot(configFile, context.workspaceRoot);
          if (!projectRoot) {
            console.error(
              `project.json file must be location in the project root directory: ${configFile}`
            );
            return {};
          }

          const packageJson = readJsonFile<PackageJson>(
            joinPaths(projectRoot, "package.json")
          );
          if (!packageJson) {
            console.error(
              `No package.json found in project root: ${projectRoot}`
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

          const tsconfigJson = readJsonFile<TsConfigJson>(
            joinPaths(projectRoot, "tsconfig.json")
          );
          if (!tsconfigJson) {
            console.error(
              `No tsconfig.json found in project root: ${projectRoot}`
            );
            return {};
          }

          const targets: ProjectConfiguration["targets"] =
            readTargetsFromPackageJson(
              packageJson as PackageJsonNx,
              readNxJson(context.workspaceRoot)
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
              plugins: ["@storm-stack/plugin-node"]
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
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
              plugins: ["@storm-stack/plugin-node"]
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development"
              }
            }
          };

          targets.build = {
            cache: true,
            inputs: ["typescript", "^production", "{projectRoot}/.storm"],
            outputs: ["{options.outputPath}"],
            executor: "@storm-stack/nx:build",
            dependsOn: ["prepare"],
            defaultConfiguration: "production",
            options: {
              outputPath: "{workspaceRoot}/dist/{projectRoot}",
              plugins: ["@storm-stack/plugin-node"]
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development"
              }
            }
          };

          setDefaultProjectTags(project, name);
          addProjectTag(project, "storm-stack" as ProjectTagVariant, "node", {
            overwrite: true
          });

          const result = project?.name
            ? {
                projects: {
                  [project.name]: {
                    ...project,
                    root: relativeRoot,
                    targets
                  }
                }
              }
            : {};
          console.log(`Writing Results for ${project?.name ?? "missing name"}`);
          console.log(result);

          return result;
        } catch (error) {
          console.error(error);
          return {};
        }
      },
      configFiles,
      options,
      context
    );
  }
];
