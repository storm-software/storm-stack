/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { type LogType, consola } from "consola";
import findCacheDirectory from "find-cache-dir";
import { createHash } from "node:crypto";
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, join } from "pathe";
import type { Tagged, UnwrapTagged } from "type-fest";
import type { UnpluginBuildContext, UnpluginContext } from "unplugin";

/* eslint-disable eqeqeq */

export function writeConsoleLog(type: LogType, ...args: string[]) {
  consola[type]("[Storm Stack]", ...args);
}

export type UnContext = UnpluginBuildContext & UnpluginContext;

export type CacheKey = Tagged<string, "cache-key">;
export type CachePath = Tagged<string, "cache-path">;
export type ID = Tagged<string, "id">;
export type Source = Tagged<string, "source">;
export type FilePath = Tagged<string, "file-path">;
export type Data = Tagged<string, "data">;

export function wrap<T extends Tagged<PropertyKey, any>>(
  value: UnwrapTagged<T>
): T {
  return value as T;
}

export function unwrap<T extends Tagged<PropertyKey, any>>(
  value: T
): UnwrapTagged<T> {
  return value as UnwrapTagged<T>;
}

/**
 * Cache class
 */
export class Cache {
  #data: Data | undefined;

  #hashKey: CacheKey;

  #hashPath: CachePath;

  constructor(id: ID, source: Source) {
    this.#hashKey = this.getHashKey(id, source);
    this.#hashPath = wrap<CachePath>(join(getCacheDir(), this.#hashKey));
    this.#data = this.getCache();
  }

  [Symbol.dispose]() {
    this.setCache();
  }

  /**
   * Get cache data
   */
  get data() {
    return this.#data;
  }

  /**
   * Set cache data
   */
  set data(value: Data | undefined) {
    this.#data = value;
  }

  private getCache() {
    if (!existsSync(this.#hashPath)) {
      return undefined;
    }

    const data = readFileSync(this.#hashPath, { encoding: "utf8" });

    /* if data does not end with hashComment, the cache is invalid */
    if (!data.endsWith(this.hashComment)) {
      return undefined;
    }

    return wrap<Data>(data);
  }

  private setCache() {
    const cacheDir = dirname(this.#hashPath);
    if (this.#data == null && existsSync(this.#hashPath)) {
      rmSync(this.#hashPath);
      return;
    }

    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    if (!this.isWritable(cacheDir)) {
      throw new Error("Cache directory is not writable.");
    }

    const cache = this.#data + this.hashComment;
    writeFileSync(this.#hashPath, cache, { encoding: "utf8" });
  }

  private getHashKey(id: ID, source: Source): CacheKey {
    const h = this.hash(source);
    const filebase = `${basename(dirname(id))}_${basename(id)}`;

    return wrap<CacheKey>(`${filebase}_${h}`);
  }

  private hash(input: string): string {
    return createHash("md5").update(input).digest("hex");
  }

  private get hashComment() {
    return `/* unplugin-storm-stack-${this.#hashKey} */`;
  }

  private isWritable(filename: string): boolean {
    try {
      accessSync(filename, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get cache directory
 * copy from https://github.com/unjs/jiti/blob/690b727d7c0c0fa721b80f8085cafe640c6c2a40/src/cache.ts
 */
function getCacheDir(): FilePath {
  const cacheDir = findCacheDirectory({
    name: "unplugin-storm-stack",
    create: true
  });

  if (cacheDir == null) {
    throw new Error("Cache directory is not found.");
  }

  return wrap<FilePath>(cacheDir);
}
