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
            dependsOn: ["^clean"],
            executor: "@storm-stack/nx:clean",
            defaultConfiguration: "production",
            options: {
              outputPath: "dist/{projectRoot}"
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
            outputs: ["{options.outputPath}"],
            dependsOn: ["clean", "^build"],
            executor: "@storm-stack/nx:prepare",
            defaultConfiguration: "production",
            options: {
              outputPath: "dist/{projectRoot}",
              autoClean: true
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
            dependsOn: ["prepare"],
            executor: "@storm-stack/nx:build",
            defaultConfiguration: "production",
            options: {
              outputPath: "dist/{projectRoot}",
              autoPrepare: true
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

          targets.docs = {
            cache: true,
            inputs: ["typescript", "^production", "{projectRoot}/.storm"],
            outputs: ["{options.outputPath}"],
            dependsOn: ["prepare", "^build"],
            executor: "@storm-stack/nx:docs",
            defaultConfiguration: "production",
            options: {
              outputPath: "dist/{projectRoot}",
              autoPrepare: true
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
          addProjectTag(
            project,
            "storm-stack" as ProjectTagVariant,
            project.projectType || "library",
            {
              overwrite: true
            }
          );

          return project?.name
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
