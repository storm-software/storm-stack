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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { existsSync } from "@stryke/fs/exists";
import {
  getProjectRoot,
  getWorkspaceRoot,
  relativeToWorkspaceRoot
} from "@stryke/fs/get-workspace-root";
import { readJsonFile } from "@stryke/fs/json";
import { listFiles } from "@stryke/fs/list-files";
import { removeFile } from "@stryke/fs/remove-file";
import { resolvePackage } from "@stryke/fs/resolve";
import { hashDirectory } from "@stryke/hash/hash-files";
import { murmurhash } from "@stryke/hash/murmurhash";
import { getUnique } from "@stryke/helpers/get-unique";
import { hasFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { PackageJson } from "@stryke/types/package-json";
import { uuid } from "@stryke/unique-id/uuid";
import defu from "defu";
import type { DirectoryJSON } from "memfs";
import { createLog } from "../lib/logger";
import { getParsedTypeScriptConfig } from "../lib/typescript/tsconfig";
import {
  __VFS_VIRTUAL__,
  Context,
  MetaInfo,
  ResolvedOptions,
  RuntimeConfig,
  WorkspaceConfig
} from "../types";
import { PartiallyResolvedContext, resolveOptions } from "./options";
import { createResolver } from "./resolver";
import { createVfs, restoreVfs } from "./vfs/virtual-file-system";

export interface CreateContextOptions {
  name?: string;
}

export const PROJECT_ROOT_HASH_LENGTH = 45;

/**
 * Generates a prefixed project root hash object.
 *
 * @remarks
 * This function returns a string where the project root hash is prefixed with the project name plus a hyphen. If the total length of this string combination exceeds 45 characters, it will truncate the hash.
 *
 * @param name - The name of the project.
 * @param projectRootHash - The hash of the project root.
 * @returns An object containing the name and project root hash.
 */
export function getPrefixedProjectRootHash(
  name: string,
  projectRootHash: string
): string {
  const combined = `${kebabCase(name)}_${projectRootHash}`;

  return combined.length > PROJECT_ROOT_HASH_LENGTH
    ? combined.slice(0, PROJECT_ROOT_HASH_LENGTH)
    : combined;
}

async function discoverTemplatePath(path: string): Promise<string[]> {
  return (
    await Promise.all([
      Promise.resolve(/.tsx?$/.test(path) && !path.includes("*") && path),
      Promise.resolve(!hasFileExtension(path) && joinPaths(path, ".ts")),
      Promise.resolve(!hasFileExtension(path) && joinPaths(path, ".tsx")),
      Promise.resolve(
        !hasFileExtension(path) && listFiles(joinPaths(path, "**/*.ts"))
      ),
      Promise.resolve(
        !hasFileExtension(path) && listFiles(joinPaths(path, "**/*.tsx"))
      )
    ])
  )
    .flat()
    .filter(Boolean) as string[];
}

export async function discoverTemplates(
  context: Context,
  paths: string[] = []
): Promise<string[]> {
  return getUnique(
    (
      await Promise.all([
        ...paths.map(discoverTemplatePath),
        discoverTemplatePath(joinPaths(context.options.sourceRoot, "plugin")),
        discoverTemplatePath(joinPaths(context.envPaths.config, "templates")),
        discoverTemplatePath(
          joinPaths(context.options.projectRoot, "templates")
        )
      ])
    )
      .flat()
      .reduce((ret, path) => {
        if (existsSync(path)) {
          ret.push(path);
        }

        return ret;
      }, [] as string[])
  );
}

export async function getChecksum(path: string): Promise<string> {
  return hashDirectory(path, {
    ignore: ["node_modules", ".git", ".nx", ".cache", ".storm", "tmp", "dist"]
  });
}

/**
 * Retrieves the persisted meta information from the context's data path.
 *
 * @param context - The build context.
 * @returns A promise that resolves to the persisted meta information, or undefined if not found.
 */
export async function getPersistedMeta(
  context: Context
): Promise<MetaInfo | undefined> {
  const metaFilePath = joinPaths(context.dataPath, "meta.json");
  if (existsSync(metaFilePath)) {
    try {
      return await readJsonFile<MetaInfo>(metaFilePath);
    } catch {
      context.log(
        LogLevelLabel.WARN,
        `Failed to read meta file at ${metaFilePath}. It may be corrupted.`
      );
      await removeFile(metaFilePath);

      context.persistedMeta = undefined;
    }
  }

  return undefined;
}

/**
 * Creates a new context for the Storm Stack build process.
 *
 * @remarks
 * This function initializes the context with the provided inline configuration, workspace configuration, and other options.
 *
 * @param inlineConfig - The inline configuration for the Storm Stack build process.
 * @param workspaceConfig - The workspace configuration for the Storm Stack project.
 * @param options - Additional options for creating the context.
 * @returns The created context.
 */
export async function createContext<
  TOptions extends ResolvedOptions = ResolvedOptions
>(
  inlineConfig: TOptions["inlineConfig"],
  workspaceConfig?: WorkspaceConfig,
  options: CreateContextOptions = {}
): Promise<Context<TOptions>> {
  const workspaceRoot = workspaceConfig?.workspaceRoot ?? getWorkspaceRoot();
  const projectRoot = (inlineConfig.root ?? getProjectRoot()) || process.cwd();

  const resolvedWorkspaceConfig = defu(workspaceConfig, {
    workspaceRoot
  });

  let projectJson: Record<string, any> | undefined;

  const projectJsonPath = joinPaths(projectRoot, "project.json");
  if (existsSync(projectJsonPath)) {
    projectJson = await readJsonFile(projectJsonPath);
  }

  let packageJson!: PackageJson;

  const packageJsonPath = joinPaths(projectRoot, "package.json");
  if (existsSync(packageJsonPath)) {
    packageJson = await readJsonFile<PackageJson>(packageJsonPath);
  } else if (inlineConfig.command === "new") {
    const workspacePackageJsonPath = joinPaths(workspaceRoot, "package.json");
    packageJson = await readJsonFile<PackageJson>(workspacePackageJsonPath);

    resolvedWorkspaceConfig.repository ??=
      typeof packageJson?.repository === "string"
        ? packageJson.repository
        : packageJson?.repository?.url;
  } else {
    throw new Error(
      `The package.json file is missing in the project root directory: ${
        projectRoot
      }. Please run the "new" command to create a new Storm Stack project.`
    );
  }

  const checksum = await getChecksum(projectRoot);
  const meta = {
    buildId: uuid(),
    releaseId: uuid(),
    checksum,
    timestamp: Date.now(),
    projectRootHash: murmurhash(joinPaths(workspaceRoot, projectRoot), {
      maxLength: PROJECT_ROOT_HASH_LENGTH
    }),
    builtinIdMap: {} as Record<string, string>,
    virtualFiles: {} as DirectoryJSON<string | null>
  };

  const artifactsPath = joinPaths(workspaceRoot, projectRoot, ".storm");
  const builtinsPath = joinPaths(artifactsPath, "builtins");
  const entryPath = joinPaths(artifactsPath, "entry");

  const envPaths = getEnvPaths({
    orgId: "storm-software",
    appId: "storm-stack",
    workspaceRoot
  });
  if (!envPaths.cache) {
    throw new Error("The cache directory could not be determined.");
  }

  envPaths.cache = joinPaths(envPaths.cache, "projects", meta.projectRootHash);

  const partiallyResolvedContext = {
    options: {
      ...resolvedWorkspaceConfig,
      name: projectJson?.name || options.name,
      ...inlineConfig,
      userConfig: {
        config: {}
      },
      inlineConfig,
      projectRoot,
      workspaceConfig: resolvedWorkspaceConfig,
      plugins: {}
    },
    meta,
    entry: [],
    envPaths,
    artifactsPath,
    builtinsPath,
    entryPath,
    dtsPath: joinPaths(envPaths.cache, "dts"),
    runtimeDtsFilePath: joinPaths(projectRoot, "storm.d.ts"),
    dataPath: joinPaths(envPaths.data, "projects", meta.projectRootHash),
    cachePath: envPaths.cache,
    projectJson,
    packageJson,
    runtime: {
      logs: [],
      storage: [],
      init: []
    } as RuntimeConfig,
    packageDeps: {},
    reflections: {},
    relativeToWorkspaceRoot: relativeToWorkspaceRoot(projectRoot)
  } as unknown as PartiallyResolvedContext<TOptions>;

  partiallyResolvedContext.resolver = createResolver({
    workspaceRoot,
    projectRoot,
    cacheDir: partiallyResolvedContext.cachePath,
    mode: partiallyResolvedContext.options.mode,
    skipCache: partiallyResolvedContext.options.skipCache ?? false
  });
  partiallyResolvedContext.log = createLog(
    options.name ?? null,
    partiallyResolvedContext.options as Parameters<typeof createLog>[1]
  );

  const resolvedOptions = await resolveOptions<TOptions>(
    partiallyResolvedContext,
    inlineConfig,
    undefined,
    projectRoot
  );
  const context = partiallyResolvedContext as Context<TOptions>;
  context.options = resolvedOptions;

  context.dataPath = joinPaths(
    context.envPaths.data,
    "projects",
    getPrefixedProjectRootHash(
      context.options.name,
      context.meta.projectRootHash
    )
  );

  context.persistedMeta = await getPersistedMeta(context);

  context.runtimeDtsFilePath = context.options.output.dts
    ? context.options.output.dts.startsWith(context.options.workspaceRoot)
      ? context.options.output.dts
      : joinPaths(context.options.workspaceRoot, context.options.output.dts)
    : joinPaths(
        context.options.workspaceRoot,
        context.options.projectRoot,
        "storm.d.ts"
      );

  context.tsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    context.options.projectRoot,
    context.options.tsconfig
  );

  if (context.persistedMeta?.checksum === context.meta.checksum) {
    context.log(
      LogLevelLabel.TRACE,
      `Restoring the virtual file system (VFS) as the meta checksum has not changed.`
    );

    context.vfs = restoreVfs(context, {
      builtinIdMap: context.persistedMeta.builtinIdMap,
      virtualFiles: context.persistedMeta.virtualFiles
    });
  } else {
    context.vfs = createVfs(context);
  }

  const packagePath = process.env.STORM_STACK_LOCAL
    ? joinPaths(context.options.workspaceRoot, "dist/packages/core")
    : await resolvePackage("@storm-stack/core");
  if (!packagePath) {
    throw new Error(
      "Could not resolve the Storm Stack core package. Please ensure it is installed."
    );
  }

  return context;
}

/**
 * Writes the meta file for the context.
 *
 * @param context - The context to write the meta file for.
 * @returns A promise that resolves when the meta file has been written.
 */
export async function writeMetaFile(context: Context): Promise<void> {
  const metaFilePath = joinPaths(context.dataPath, "meta.json");

  context.log(
    LogLevelLabel.DEBUG,
    `Writing runtime metadata to ${metaFilePath}`
  );

  await context.vfs.writeFileToDisk(
    metaFilePath,
    JSON.stringify(
      {
        ...context.meta,
        builtinIdMap: Object.fromEntries(context.vfs.builtinIdMap.entries()),
        virtualFiles: context.vfs[__VFS_VIRTUAL__].toJSON(context.artifactsPath)
      },
      null,
      2
    )
  );
}
