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

import { deserializeType, ReflectionClass } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readJsonFile } from "@stryke/fs/json";
import { listFiles } from "@stryke/fs/list-files";
import { removeFile } from "@stryke/fs/remove-file";
import { hash } from "@stryke/hash/hash";
import { hashDirectory } from "@stryke/hash/hash-files";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import { relativeToWorkspaceRoot } from "@stryke/path/file-path-fns";
import {
  getProjectRoot,
  getWorkspaceRoot
} from "@stryke/path/get-workspace-root";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { PackageJson } from "@stryke/types/package-json";
import { nanoid } from "@stryke/unique-id/nanoid-client";
import defu from "defu";
import { DirectoryJSON } from "memfs";
import {
  __VFS_VIRTUAL__,
  Context,
  InlineConfig,
  MetaInfo,
  ResolvedOptions,
  RuntimeConfig,
  SerializedContext,
  WorkspaceConfig
} from "../types";
import { PartiallyResolvedContext, resolveConfig } from "./config";
import { createLog } from "./logger";
import { createResolver } from "./resolver";
import { getParsedTypeScriptConfig } from "./typescript/tsconfig";
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

export async function discoverTemplates(path: string): Promise<string[]> {
  const result = await Promise.all([
    listFiles(joinPaths(path, "**/*.ts")),
    listFiles(joinPaths(path, "**/*.tsx"))
  ]);

  return result.flat();
}

export async function getChecksum(path: string): Promise<string> {
  return hashDirectory(path, {
    ignore: ["node_modules", ".git", ".nx", ".cache", ".storm", "tmp", "dist"]
  });
}

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
export async function createContext<TContext extends Context = Context>(
  inlineConfig: InlineConfig,
  workspaceConfig?: WorkspaceConfig,
  options: CreateContextOptions = {}
): Promise<TContext> {
  const workspaceRoot = workspaceConfig?.workspaceRoot ?? getWorkspaceRoot();
  const projectRoot = inlineConfig.root || getProjectRoot() || process.cwd();

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
    buildId: nanoid(24),
    releaseId: nanoid(24),
    checksum,
    timestamp: Date.now(),
    projectRootHash: hash(joinPaths(workspaceRoot, projectRoot), {
      maxLength: PROJECT_ROOT_HASH_LENGTH
    }),
    runtimeIdMap: {} as Record<string, string>,
    virtualFiles: {} as DirectoryJSON<string | null>
  };

  const artifactsPath = joinPaths(workspaceRoot, projectRoot, ".storm");
  const runtimePath = joinPaths(artifactsPath, "runtime");
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
      plugins: {} as ResolvedOptions["plugins"]
    },
    log: createLog(
      options.name ?? null,
      defu(inlineConfig, resolvedWorkspaceConfig) as Partial<ResolvedOptions>
    ),
    meta,
    envPaths,
    artifactsPath,
    runtimePath,
    entryPath,
    dtsPath: joinPaths(envPaths.cache, "dts"),
    runtimeDtsFilePath: joinPaths(projectRoot, "storm.d.ts"),
    dataPath: joinPaths(envPaths.data, "projects", meta.projectRootHash),
    cachePath: envPaths.cache,
    templates: [],
    projectJson,
    packageJson,
    runtime: {
      logs: [],
      storage: [],
      init: []
    } as RuntimeConfig,
    dotenv: {},
    packageDeps: {},
    workers: {} as TContext["workers"],
    reflections: {},
    resolver: createResolver({
      workspaceRoot,
      projectRoot,
      cacheDir: envPaths.cache
    }),
    relativeToWorkspaceRoot: relativeToWorkspaceRoot(projectRoot)
  } as PartiallyResolvedContext;

  partiallyResolvedContext.options = await resolveConfig(
    partiallyResolvedContext,
    inlineConfig,
    undefined,
    projectRoot
  );
  const context = partiallyResolvedContext as TContext;

  context.dataPath = joinPaths(
    context.envPaths.data,
    "projects",
    getPrefixedProjectRootHash(
      context.options.name,
      context.meta.projectRootHash
    )
  );

  context.persistedMeta = await getPersistedMeta(context);

  context.templates = (
    await Promise.all([
      discoverTemplates(context.options.templates),
      discoverTemplates(joinPaths(context.envPaths.config, "templates")),
      discoverTemplates(joinPaths(projectRoot, "templates"))
    ])
  ).flat();

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
      runtimeIdMap: context.persistedMeta.runtimeIdMap,
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

  // context.workers.errorLookup = createWorker(
  //   joinPaths(packagePath, "workers", "error-lookup.cjs"),
  //   ["find"]
  // );
  // context.workers.configReflection = createWorker(
  //   joinPaths(packagePath, "workers", "config-reflection.cjs"),
  //   ["add", "clear"]
  // );

  return context;
}

/**
 * Serializes the context to a format suitable for sending over the network.
 *
 * @param context - The context to serialize.
 * @returns The serialized context.
 */
export function serializeContext(context: Context): SerializedContext {
  return {
    ...context,
    log: null,
    workers: null,
    resolver: null,
    compiler: null,
    unimport: null,
    reflections: Object.entries(context.reflections).reduce(
      (ret, [key, reflection]) => {
        ret[key] = reflection.serializeType();
        return ret;
      },
      {}
    ),
    tsconfig: {
      tsconfigFilePath: context.tsconfig.tsconfigFilePath,
      tsconfigJson: context.tsconfig.tsconfigJson
    },
    vfs: {
      runtimeIdMap: context.vfs.runtimeIdMap
        .entries()
        .reduce((ret, [key, value]) => {
          ret[key] = value;

          return ret;
        }, {}),
      virtualFiles: context.vfs[__VFS_VIRTUAL__].toJSON(context.artifactsPath)
    }
  };
}

/**
 * Deserializes the context from a serialized format.
 *
 * @param serialized - The serialized context.
 * @param logName - The name of the log to use for the context.
 * @returns The deserialized context.
 */
export function deserializeContext(
  serialized: SerializedContext,
  logName: string | null = null
): Context {
  const context = {
    ...serialized,
    log: createLog(logName, serialized.options),
    reflections: Object.keys(serialized.reflections).reduce(
      (ret, key) => {
        ret[key] = ReflectionClass.from(
          deserializeType(serialized.reflections[key])
        );
        return ret;
      },
      {} as Record<string, ReflectionClass<any>>
    ),
    resolver: createResolver({
      workspaceRoot: serialized.options.workspaceRoot,
      projectRoot: serialized.options.projectRoot,
      cacheDir: serialized.envPaths.cache
    }),
    vfs: {} as Context["vfs"],
    compiler: {} as Context["compiler"],
    tsconfig: {} as Context["tsconfig"],
    workers: {} as Context["workers"],
    unimport: {} as Context["unimport"]
  } as Context;

  context.vfs = restoreVfs(context, serialized.vfs);
  context.tsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    serialized.options.projectRoot,
    serialized.tsconfig.tsconfigFilePath,
    serialized.tsconfig.tsconfigJson
  );

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

  context.meta.runtimeIdMap = context.vfs.runtimeIdMap.entries().reduce(
    (map, [id, path]) => {
      map[id] = path;
      return map;
    },
    {} as Record<string, string>
  );
  context.meta.virtualFiles = context.vfs[__VFS_VIRTUAL__].toJSON(
    context.artifactsPath
  );

  return context.vfs.writeFileToDisk(
    metaFilePath,
    StormJSON.stringify(context.meta)
  );
}
