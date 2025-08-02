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
import { createNodesFromFiles } from "@nx/devkit";
import type { ProjectTagVariant } from "@storm-software/workspace-tools";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot
} from "@storm-software/workspace-tools/utils/plugin-helpers";
import {
  addProjectTag,
  setDefaultProjectTags
} from "@storm-software/workspace-tools/utils/project-tags";
import { loadUserConfigFile } from "@storm-stack/core/lib/config";
import { PROJECT_ROOT_HASH_LENGTH } from "@storm-stack/core/lib/context";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readJsonFileSync } from "@stryke/fs/json";
import { hash } from "@stryke/hash/hash";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import type { PackageJson } from "@stryke/types/package-json";
import { createJiti } from "jiti";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";

/* eslint-disable no-console */

export const PLUGIN_NAME = "storm-stack/nx";

const stormConfigGlob =
  "**/{package.json,storm.json,storm.config.json,storm.jsonc,storm.config.jsonc,storm.json5,storm.config.json5,storm.yaml,storm.config.yaml,storm.yml,storm.config.yml,storm.toml,storm.config.toml,storm.js,storm.config.js,storm.ts,storm.config.ts,storm.mjs,storm.config.mjs,storm.cjs,storm.config.cjs,storm.mts,storm.config.mts,storm.cts,storm.config.cts}";

export interface StormStackNxPluginOptions {}

export const createNodesV2: CreateNodesV2<StormStackNxPluginOptions> = [
  stormConfigGlob,
  async (configFiles, optionsV2, contextV2): Promise<CreateNodesResultV2> => {
    const envPaths = getEnvPaths({
      orgId: "storm-software",
      appId: "storm-stack",
      workspaceRoot: contextV2.workspaceRoot
    });
    if (!envPaths.cache) {
      throw new Error("The cache directory could not be determined.");
    }

    return createNodesFromFiles(
      async (configFile, options, context) => {
        try {
          const projectRoot = getProjectRoot(configFile, context.workspaceRoot);
          if (!projectRoot) {
            console.error(
              `[storm-stack/nx]: package.json and Storm Stack configuration files (i.e. storm.config.ts) must be located in the project root directory: ${configFile}`
            );

            return {};
          }

          const cacheDir = joinPaths(
            envPaths.cache,
            "projects",
            hash(joinPaths(context.workspaceRoot, projectRoot), {
              maxLength: PROJECT_ROOT_HASH_LENGTH
            })
          );

          const jiti = createJiti(
            joinPaths(context.workspaceRoot, projectRoot),
            {
              interopDefault: true,
              fsCache: joinPaths(cacheDir, "jiti"),
              moduleCache: true
            }
          );

          const userConfig = await loadUserConfigFile(projectRoot, jiti);
          const packageJson = readJsonFileSync<PackageJson>(
            joinPaths(projectRoot, "package.json")
          );

          const projectConfig = getProjectConfigFromProjectRoot(
            projectRoot,
            packageJson
          );
          if (!projectConfig) {
            console.warn(
              `[storm-stack/nx]: No project configuration found for project in root directory ${projectRoot}`
            );

            return {};
          }

          const tsconfig =
            userConfig?.tsconfig ||
            (existsSync(joinPaths(projectRoot, "tsconfig.json"))
              ? joinPaths(projectRoot, "tsconfig.json")
              : undefined);

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

          // const namedInputs = getNamedInputs(projectRoot, context);
          // const tsConfig = retrieveTsConfigFromCache(
          //   configFilePath,
          //   context.workspaceRoot
          // );

          // let internalProjectReferences: Record<string, ParsedTsconfigData>;
          // // Typecheck target
          // if (
          //   basename(configFilePath) === "tsconfig.json" &&
          //   options.typecheck &&
          //   tsConfig.raw?.nx?.addTypecheckTarget !== false
          // ) {
          //   internalProjectReferences = resolveInternalProjectReferences(
          //     tsConfig,
          //     context.workspaceRoot,
          //     projectRoot
          //   );
          //   const externalProjectReferences =
          //     resolveShallowExternalProjectReferences(
          //       tsConfig,
          //       context.workspaceRoot,
          //       projectRoot
          //     );
          //   const targetName = options.typecheck.targetName;
          //   if (!targets[targetName]) {
          //     let command = `tsc --build --emitDeclarationOnly${
          //       options.verboseOutput ? " --verbose" : ""
          //     }`;
          //     if (
          //       tsConfig.options.noEmit ||
          //       Object.values(internalProjectReferences).some(
          //         ref => ref.options.noEmit
          //       ) ||
          //       Object.values(externalProjectReferences).some(
          //         ref => ref.options.noEmit
          //       )
          //     ) {
          //       // `tsc --build` does not work with `noEmit: true`
          //       command = `echo "The 'typecheck' target is disabled because one or more project references set 'noEmit: true' in their tsconfig. Remove this property to resolve this issue."`;
          //     }

          //     const dependsOn: string[] = [`^${targetName}`];
          //     if (options.build && targets[options.build.targetName]) {
          //       // we already processed and have a build target
          //       dependsOn.unshift(options.build.targetName);
          //     } else if (options.build) {
          //       // check if the project will have a build target
          //       const buildConfigPath = joinPaths(
          //         projectRoot,
          //         options.build.configName
          //       );
          //       if (
          //         context.configFiles.includes(buildConfigPath) &&
          //         isValidPackageJsonBuildConfig(
          //           retrieveTsConfigFromCache(
          //             buildConfigPath,
          //             context.workspaceRoot
          //           ),
          //           context.workspaceRoot,
          //           projectRoot
          //         )
          //       ) {
          //         dependsOn.unshift(options.build.targetName);
          //       }
          //     }
          //   }
          // }

          targets.clean = {
            dependsOn: ["^clean"],
            executor: "@storm-stack/nx:clean",
            defaultConfiguration: "production",
            options: {
              outputPath: userConfig.output?.outputPath || "dist/{projectRoot}",
              projectType: projectConfig.projectType,
              skipInstalls: userConfig.skipInstalls
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development",
                skipCache: true
              }
            }
          };

          targets.prepare = {
            cache: true,
            inputs: ["typescript", "^production"],
            outputs: ["{projectRoot}/.storm"],
            dependsOn: ["clean", "^prepare"],
            executor: "@storm-stack/nx:prepare",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType,
              tsconfig,
              skipInstalls: userConfig.skipInstalls,
              skipCache: userConfig.skipCache
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development",
                skipCache: true
              }
            }
          };

          targets.build = {
            cache: true,
            inputs: ["typescript", "^production", "{projectRoot}/.storm"],
            outputs: ["{options.outputPath}"],
            dependsOn: ["prepare", "^build"],
            executor: "@storm-stack/nx:build",
            defaultConfiguration: "production",
            options: {
              entry: userConfig.entry || "{sourceRoot}/index.ts",
              outputPath: userConfig.output?.outputPath || "dist/{projectRoot}",
              projectType: projectConfig.projectType,
              tsconfig,
              skipInstalls: userConfig.skipInstalls,
              skipCache: userConfig.skipCache,
              skipLint: userConfig.skipLint
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development",
                skipCache: true
              }
            }
          };

          targets.lint = {
            cache: true,
            inputs: ["typescript", "^production", "{projectRoot}/.storm"],
            dependsOn: ["prepare", "^lint"],
            executor: "@storm-stack/nx:lint",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType,
              tsconfig,
              skipInstalls: userConfig.skipInstalls,
              skipCache: userConfig.skipCache
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development",
                skipCache: true
              }
            }
          };

          targets.docs = {
            cache: true,
            inputs: ["typescript", "^production", "{projectRoot}/.storm"],
            outputs: ["{projectRoot}/docs/generated"],
            dependsOn: ["prepare", "build", "^docs"],
            executor: "@storm-stack/nx:docs",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType,
              tsconfig,
              skipInstalls: userConfig.skipInstalls,
              skipCache: userConfig.skipCache
            },
            configurations: {
              production: {
                mode: "production"
              },
              staging: {
                mode: "staging"
              },
              development: {
                mode: "development",
                skipCache: true
              }
            }
          };

          setDefaultProjectTags(projectConfig, PLUGIN_NAME);
          addProjectTag(
            projectConfig,
            "storm-stack" as ProjectTagVariant,
            projectConfig.projectType || "library",
            {
              overwrite: true
            }
          );

          return projectConfig?.name
            ? {
                projects: {
                  [projectConfig.name]: {
                    ...projectConfig,
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
      optionsV2,
      contextV2
    );
  }
];

// function getInputs(
//   namedInputs: NxJsonConfiguration["namedInputs"],
//   configFilePath: string,
//   tsConfig: ParsedTsconfigData,
//   internalProjectReferences: Record<string, ParsedTsconfigData>,
//   workspaceRoot: string,
//   projectRoot: string
// ): TargetConfiguration["inputs"] {
//   const configFiles = new Set<string>();
//   const externalDependencies = ["typescript"];

//   const extendedConfigFiles = getExtendedConfigFiles(tsConfig, workspaceRoot);
//   extendedConfigFiles.files.forEach(configPath => {
//     configFiles.add(configPath);
//   });
//   externalDependencies.push(...extendedConfigFiles.packages);

//   const includePaths = new Set<string>();
//   const excludePaths = new Set<string>();
//   const projectTsConfigFiles: [string, ParsedTsconfigData][] = [
//     [configFilePath, tsConfig],
//     ...Object.entries(internalProjectReferences)
//   ];
//   const absoluteProjectRoot = join(workspaceRoot, projectRoot);

//   if (!ts) {
//     ts = require("typescript");
//   }
//   // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9869
//   const supportedTSExtensions: readonly Extension[] = [
//     ts.Extension.Ts,
//     ts.Extension.Tsx,
//     ts.Extension.Dts,
//     ts.Extension.Cts,
//     ts.Extension.Dcts,
//     ts.Extension.Mts,
//     ts.Extension.Dmts
//   ];
//   // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9878
//   const allSupportedExtensions: readonly Extension[] = [
//     ts.Extension.Ts,
//     ts.Extension.Tsx,
//     ts.Extension.Dts,
//     ts.Extension.Js,
//     ts.Extension.Jsx,
//     ts.Extension.Cts,
//     ts.Extension.Dcts,
//     ts.Extension.Cjs,
//     ts.Extension.Mts,
//     ts.Extension.Dmts,
//     ts.Extension.Mjs
//   ];

//   const normalizeInput = (
//     input: string,
//     config: ParsedTsconfigData
//   ): string[] => {
//     const extensions = config.options.allowJs
//       ? [...allSupportedExtensions]
//       : [...supportedTSExtensions];
//     if (config.options.resolveJsonModule) {
//       extensions.push(ts.Extension.Json);
//     }

//     const segments = input.split("/");
//     // An "includes" path "foo" is implicitly a glob "foo/**/*" if its last
//     // segment has no extension, and does not contain any glob characters
//     // itself.
//     // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9577-L9585
//     if (!/[.*?]/.test(segments.at(-1))) {
//       return extensions.map(ext => `${segments.join("/")}/**/*${ext}`);
//     }

//     return [input];
//   };

//   const configDirTemplate = "${configDir}";
//   const substituteConfigDir = (p: string) =>
//     p.startsWith(configDirTemplate) ? p.replace(configDirTemplate, "./") : p;

//   projectTsConfigFiles.forEach(([configPath, config]) => {
//     configFiles.add(configPath);
//     const offset = relative(absoluteProjectRoot, dirname(configPath));
//     (config.raw?.include ?? []).forEach((p: string) => {
//       const normalized = normalizeInput(
//         join(offset, substituteConfigDir(p)),
//         config
//       );
//       normalized.forEach(input => includePaths.add(input));
//     });

//     if (config.raw?.exclude) {
//       /**
//        * We need to filter out the exclude paths that are already included in
//        * other tsconfig files. If they are not included in other tsconfig files,
//        * they still correctly apply to the current file and we should keep them.
//        */
//       const otherFilesInclude: string[] = [];
//       projectTsConfigFiles.forEach(([path, c]) => {
//         if (path !== configPath) {
//           otherFilesInclude.push(
//             ...(c.raw?.include ?? []).map(substituteConfigDir)
//           );
//         }
//       });
//       const normalize = (p: string) => (p.startsWith("./") ? p.slice(2) : p);
//       config.raw.exclude.forEach((e: string) => {
//         const excludePath = substituteConfigDir(e);
//         if (
//           !otherFilesInclude.some(
//             includePath =>
//               picomatch(normalize(excludePath))(normalize(includePath)) ||
//               picomatch(normalize(includePath))(normalize(excludePath))
//           )
//         ) {
//           excludePaths.add(excludePath);
//         }
//       });
//     }
//   });

//   const inputs: TargetConfiguration["inputs"] = [];
//   if (includePaths.size) {
//     if (existsSync(join(workspaceRoot, projectRoot, "package.json"))) {
//       inputs.push("{projectRoot}/package.json");
//     }
//     inputs.push(
//       ...Array.from(configFiles).map((p: string) =>
//         pathToInputOrOutput(p, workspaceRoot, projectRoot)
//       ),
//       ...Array.from(includePaths).map((p: string) =>
//         pathToInputOrOutput(
//           joinPathFragments(projectRoot, p),
//           workspaceRoot,
//           projectRoot
//         )
//       )
//     );
//   } else {
//     // If we couldn't identify any include paths, we default to the default
//     // named inputs.
//     inputs.push("production" in namedInputs ? "production" : "default");
//   }

//   if (excludePaths.size) {
//     inputs.push(
//       ...Array.from(excludePaths).map(
//         (p: string) =>
//           `!${pathToInputOrOutput(
//             joinPathFragments(projectRoot, p),
//             workspaceRoot,
//             projectRoot
//           )}`
//       )
//     );
//   }

//   if (
//     hasExternalProjectReferences(
//       configFilePath,
//       tsConfig,
//       workspaceRoot,
//       projectRoot
//     )
//   ) {
//     // Importing modules from a referenced project will load its output declaration files (d.ts)
//     // https://www.typescriptlang.org/docs/handbook/project-references.html#what-is-a-project-reference
//     inputs.push({ dependentTasksOutputFiles: "**/*.d.ts" });
//   } else {
//     inputs.push("production" in namedInputs ? "^production" : "^default");
//   }

//   inputs.push({ externalDependencies });

//   return inputs;
// }
