/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { CreateNodesResultV2, CreateNodesV2 } from "@nx/devkit";
import { createNodesFromFiles, readJsonFile } from "@nx/devkit";
import { joinPaths } from "@storm-software/eslint/utils/correct-paths";
import {
  ProjectTagPlatformValue,
  ProjectTagVariant
} from "@storm-software/workspace-tools/types";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot,
  getRoot
} from "@storm-software/workspace-tools/utils/plugin-helpers";
import {
  addProjectTag,
  setDefaultProjectTags
} from "@storm-software/workspace-tools/utils/project-tags";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";
import { StormStackProjectTagScopeValue } from "../types";
import { addProjectScopeTag } from "../utilities/project-tags";

/* eslint-disable no-console */

export const name = "storm-stack/tools/plugin";

export interface StormStackToolsPluginOptions {}

export const createNodesV2: CreateNodesV2<StormStackToolsPluginOptions> = [
  "packages/plugin-*/project.json",
  async (configFiles, optionsV2, contextV2): Promise<CreateNodesResultV2> => {
    return createNodesFromFiles(
      (configFile, options, context) => {
        try {
          const projectRoot = getProjectRoot(configFile, context.workspaceRoot);
          if (!projectRoot) {
            console.warn(
              `[${name}]: project.json file must be located in the project root directory: ${configFile}`
            );

            return {};
          }

          const root = getRoot(projectRoot, context);

          const packageJson = readJsonFile<PackageJson>(
            joinPaths(projectRoot, "package.json")
          );
          if (!packageJson) {
            console.warn(
              `[${name}]: No package.json found in project root: ${projectRoot}`
            );

            return {};
          }

          const projectConfig = getProjectConfigFromProjectRoot(
            projectRoot,
            packageJson
          );

          const projectName =
            projectConfig.name ||
            (packageJson.name?.includes("/")
              ? packageJson.name.split("/").pop()
              : packageJson.name);
          if (!projectName) {
            console.warn(
              `[${name}]: No name could be found for the project: ${projectRoot}`
            );

            return {};
          }

          const tsconfigJson = readJsonFile<TsConfigJson>(
            joinPaths(projectRoot, "tsconfig.json")
          );
          if (!tsconfigJson) {
            console.warn(
              `[${name}]: No tsconfig.json found in project root: ${projectRoot}`
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

          targets["build-base"] ??= {
            cache: true,
            inputs: [
              `{workspaceRoot}/${configFile}`,
              "typescript",
              "^production"
            ],
            outputs: ["{projectRoot}/dist"],
            executor: "nx:run-commands",
            dependsOn: ["^build"],
            options: {
              command: 'tsup-node --config="tsup.config.ts"',
              cwd: root
            }
          };

          targets.build ??= {
            cache: true,
            inputs: [
              "{workspaceRoot}/LICENSE",
              "{projectRoot}/dist",
              "{projectRoot}/*.md",
              "{projectRoot}/package.json"
            ],
            outputs: [`{workspaceRoot}/dist/${root}`],
            executor: "nx:run-commands",
            dependsOn: ["build-base"],
            options: {
              commands: [
                `pnpm copyfiles LICENSE dist/${root}`,
                `pnpm copyfiles --up=2 ./${root}/*.md ./${
                  root
                }/package.json dist/${root}`,
                `pnpm copyfiles --up=3 "./${root}/dist/**/*" dist/${root}/dist`
              ]
            }
          };

          setDefaultProjectTags(projectConfig, name);
          addProjectTag(
            projectConfig,
            ProjectTagVariant.PLATFORM,
            ProjectTagPlatformValue.NODE,
            {
              overwrite: true
            }
          );
          addProjectScopeTag(
            projectConfig,
            StormStackProjectTagScopeValue.PLUGIN
          );

          const implicitDependencies = [] as string[];
          if (!projectConfig?.implicitDependencies?.includes("core")) {
            implicitDependencies.push("core");
          }
          if (!projectConfig?.implicitDependencies?.includes("devkit")) {
            implicitDependencies.push("devkit");
          }

          console.log(`[${name}]: ${root} / ${projectRoot}`);

          return {
            projects: {
              [root]: defu(
                {
                  projectType: "library"
                },
                projectConfig,
                {
                  root,
                  sourceRoot: joinPaths(root, "src"),
                  targets,
                  implicitDependencies
                }
              )
            }
          };
        } catch (error) {
          console.error(`[${name}]: ${JSON.stringify(error)}`);

          return {};
        }
      },
      configFiles,
      optionsV2 ?? {},
      contextV2
    );
  }
];
