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

import { isWritable } from "@stryke/fs/chmod-x";
import { createDirectory } from "@stryke/fs/helpers";
import { readFile } from "@stryke/fs/read-file";
import { removeFile } from "@stryke/fs/remove-file";
import { writeFile } from "@stryke/fs/write-file";
import { hash } from "@stryke/hash";
import { existsSync } from "@stryke/path/exists";
import { findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type MagicString from "magic-string";
import type { SourceFile } from "../types/build";
import { getString } from "./utilities/magic-string";

/**
 * Get the source key.
 *
 * @param id - The name of the file to compile.
 * @param code - The source code to compile.
 * @returns The source key.
 */
function getCacheHashKey(id: string, code: string | MagicString): string {
  return hash(
    {
      id,
      code: getString(code)
    },
    {
      maxLength: 32
    }
  );
}

/**
 * Get the source key.
 *
 * @param id - The name of the file to compile.
 * @param hashKey - The hash key.
 * @returns The source key.
 */
function getCacheFileName(id: string, hashKey: string): string {
  return `${findFileName(id, { withExtension: false })}_${hashKey}.cache`;
}

export async function getCache(sourceFile: SourceFile, cacheDir: string) {
  const hashKey = getCacheHashKey(sourceFile.id, sourceFile.code);

  const cacheFilePath = joinPaths(
    cacheDir,
    getCacheFileName(sourceFile.id, hashKey)
  );
  if (!existsSync(cacheFilePath)) {
    return undefined;
  }

  const cache = await readFile(cacheFilePath);
  if (!cache.includes(hashComment(hashKey))) {
    return undefined;
  }

  return cache;
}

export async function setCache(
  sourceFile: SourceFile,
  cacheDir: string,
  transpiled?: string
) {
  const hashKey = getCacheHashKey(sourceFile.id, sourceFile.code);

  const cacheFilePath = joinPaths(
    cacheDir,
    getCacheFileName(sourceFile.id, hashKey)
  );
  if (existsSync(cacheFilePath)) {
    await removeFile(cacheFilePath);
  }

  if (transpiled) {
    if (!existsSync(cacheDir)) {
      await createDirectory(cacheDir);
    }
    if (!(await isWritable(cacheDir))) {
      throw new Error(`Cache directory is not writable: ${cacheDir}`);
    }

    await writeFile(
      cacheFilePath,
      `${transpiled}

${hashComment(hashKey)}`.trim()
    );
  }
}

function hashComment(hashKey: string): string {
  return `/* storm-stack_${hashKey} */`;
}
