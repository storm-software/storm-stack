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
import { joinPaths } from "@storm-software/eslint/utils/correct-paths";
import {
  ProjectTagPlatformValue,
  ProjectTagVariant
} from "@storm-software/workspace-tools/types";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot
} from "@storm-software/workspace-tools/utils/plugin-helpers";
import {
  addProjectTag,
  setDefaultProjectTags
} from "@storm-software/workspace-tools/utils/project-tags";
import type { PackageJson } from "@stryke/types/utility-types/package-json";
import type { TsConfigJson } from "@stryke/types/utility-types/tsconfig";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";
import { StormStackProjectTagScopeValue } from "../types";
import { addProjectScopeTag } from "../utilities/project-tags";

/* eslint-disable no-console */

export const name = "storm-stack/plugin";

export interface StormStackPluginPluginOptions {}

export const createNodesV2: CreateNodesV2<StormStackPluginPluginOptions> = [
  "packages/plugin-*/project.json",
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
          while (relativeRoot.startsWith(".")) {
            relativeRoot = relativeRoot.slice(1);
          }
          while (relativeRoot.startsWith("/")) {
            relativeRoot = relativeRoot.slice(1);
          }

          targets["build-base"] ??= {
            cache: true,
            inputs: [
              `{workspaceRoot}/${configFile}`,
              "typescript",
              "^production"
            ],
            outputs: ["{projectRoot}/dist"],
            executor: "nx:run-commands",
            dependsOn: ["build-untyped", "^build"],
            options: {
              command: 'tsup-node --config="tsup.config.ts"',
              cwd: relativeRoot
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
            outputs: ["{workspaceRoot}/dist/{projectRoot}"],
            executor: "nx:run-commands",
            dependsOn: ["build-untyped", "build-base"],
            options: {
              commands: [
                `pnpm copyfiles LICENSE dist/${relativeRoot}`,
                `pnpm copyfiles --up=2 ./${relativeRoot}/*.md ./${relativeRoot}/package.json dist/${relativeRoot}`,
                `pnpm copyfiles --up=3 "./${relativeRoot}/dist/**/*" dist/${relativeRoot}/dist`
              ]
            }
          };

          setDefaultProjectTags(project, name);
          addProjectTag(
            project,
            ProjectTagVariant.PLATFORM,
            ProjectTagPlatformValue.NODE,
            {
              overwrite: true
            }
          );
          addProjectScopeTag(project, StormStackProjectTagScopeValue.PLUGIN);

          const implicitDependencies = project.implicitDependencies ?? [];
          if (!implicitDependencies.includes("storm-stack")) {
            implicitDependencies.push("storm-stack");
          }

          const result = project?.name
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
          console.log(`Writing Results for ${project?.name ?? "missing name"}`);
          console.log(result);

          return result;
        } catch (error_) {
          console.error(error_);
          return {};
        }
      },
      configFiles,
      options,
      context
    );
  }
];
