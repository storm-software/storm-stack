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
import type { ProjectTagVariant } from "@storm-software/workspace-tools/types";
import { withNamedInputs } from "@storm-software/workspace-tools/utils/nx-json";
import {
  getProjectConfigFromProjectRoot,
  getProjectRoot,
  getRoot
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
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isError } from "@stryke/type-checks/is-error";
import type { PackageJson } from "@stryke/types/package-json";
import defu from "defu";
import { createJiti } from "jiti";
import { join } from "node:path";
import { readNxJson } from "nx/src/config/nx-json.js";
import type { ProjectConfiguration } from "nx/src/config/workspace-json-project-json.js";
import type { PackageJson as PackageJsonNx } from "nx/src/utils/package-json.js";
import { readTargetsFromPackageJson } from "nx/src/utils/package-json.js";
import { CONFIG_INPUTS } from "../helpers/constants";

/* eslint-disable no-console */

export const name = "storm-stack/nx/plugin";

const stormConfigGlob =
  "**/{package.json,storm.json,storm.*.json,storm.jsonc,storm.*.jsonc,storm.json5,storm.*.json5,storm.yaml,storm.*.yaml,storm.yml,storm.*.yml,storm.toml,storm.*.toml,storm.js,storm.*.js,storm.ts,storm.*.ts,storm.mjs,storm.*.mjs,storm.cjs,storm.*.cjs,storm.mts,storm.*.mts,storm.cts,storm.*.cts}";

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

    const nxJson = readNxJson(contextV2.workspaceRoot);

    return createNodesFromFiles(
      async (configFile, options, context) => {
        try {
          const projectRoot = getProjectRoot(configFile, context.workspaceRoot);
          if (!projectRoot) {
            console.error(
              `[${name}]: package.json and Storm Stack configuration files (i.e. storm.config.ts) must be located in the project root directory: ${configFile}`
            );

            return {};
          }

          const root = getRoot(projectRoot, context);

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
              `[${name}]: No project configuration found for project in root directory ${projectRoot}`
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
              nxJson,
              projectRoot,
              context.workspaceRoot
            );

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
              projectType: projectConfig.projectType || userConfig.type,
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
            inputs: withNamedInputs(CONFIG_INPUTS, ["typescript"]),
            outputs: ["{projectRoot}/.storm"],
            dependsOn: ["clean", "^prepare"],
            executor: "@storm-stack/nx:prepare",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType || userConfig.type,
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

          targets["type-check"] ??= {
            cache: true,
            inputs: ["typescript", "^production"],
            outputs: ["{workspaceRoot}/dist/{projectRoot}"],
            executor: "nx:run-commands",
            dependsOn: ["^type-check", "^build"],
            options: {
              command: `pnpm exec tsc --noEmit --pretty --project ${
                userConfig.tsconfig || join(projectConfig.root, "tsconfig.json")
              }`
            }
          };

          targets.build = {
            cache: true,
            inputs: withNamedInputs(CONFIG_INPUTS, ["typescript"]),
            outputs: ["{options.outputPath}"],
            dependsOn: ["prepare", "^build"],
            executor: "@storm-stack/nx:build",
            defaultConfiguration: "production",
            options: {
              entry: userConfig.entry || "{sourceRoot}/index.ts",
              outputPath: userConfig.output?.outputPath || "dist/{projectRoot}",
              projectType: projectConfig.projectType || userConfig.type,
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
            inputs: withNamedInputs(
              [...CONFIG_INPUTS, "{projectRoot}/.storm"],
              ["linting", "typescript"]
            ),
            outputs: withNamedInputs(["{projectRoot}/.storm"], ["typescript"]),
            dependsOn: ["prepare", "^lint"],
            executor: "@storm-stack/nx:lint",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType || userConfig.type,
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
            inputs: withNamedInputs(
              [...CONFIG_INPUTS, "{projectRoot}/.storm"],
              ["documentation", "typescript"]
            ),
            outputs: ["{projectRoot}/docs/generated"],
            dependsOn: ["prepare", "build", "^docs"],
            executor: "@storm-stack/nx:docs",
            defaultConfiguration: "production",
            options: {
              projectType: projectConfig.projectType || userConfig.type,
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

          setDefaultProjectTags(projectConfig, name);
          addProjectTag(
            projectConfig,
            "storm-stack" as ProjectTagVariant,
            projectConfig.projectType || userConfig.type || "library",
            {
              overwrite: true
            }
          );

          return {
            projects: {
              [root]: defu(projectConfig, {
                name: kebabCase(userConfig.name)!,
                projectType: userConfig.type || "library",
                root,
                sourceRoot: joinPaths(root, "src"),
                targets
              })
            }
          };
        } catch (error) {
          console.error(
            `[${name}]: ${isError(error) ? error.message : "Unknown fatal error"}`
          );

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
