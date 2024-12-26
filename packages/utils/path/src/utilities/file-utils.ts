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

import { StormJSON } from "@storm-stack/json/storm-json";
import type {
  JsonParseOptions,
  JsonSerializeOptions
} from "@storm-stack/json/types";
import { isError } from "@storm-stack/types/type-checks/is-error";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  WriteStream
} from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createGunzip } from "node:zlib";
import * as tar from "tar-stream";

export function createDirectory(path: string) {
  mkdirSync(path, { recursive: true });
}

export interface JsonReadOptions extends JsonParseOptions {
  /**
   * mutable field recording whether JSON ends with new line
   *
   * @defaultValue false
   */
  endsWithNewline?: boolean;
}

export interface JsonWriteOptions extends JsonSerializeOptions {
  /**
   * whether to append new line at the end of JSON file
   *
   * @defaultValue false
   */
  appendNewLine?: boolean;
}

/**
 * Reads a JSON file and returns the object the JSON content represents.
 *
 * @param path - A path to a file.
 * @param options - JSON parse options
 * @returns Object the JSON content of the file represents
 */
export function readJsonFile<T extends object = any>(
  path: string,
  options?: JsonReadOptions
): T {
  const content = readFileSync(path, "utf8");
  if (options) {
    options.endsWithNewline = content.codePointAt(content.length - 1) === 10;
  }

  try {
    return StormJSON.parseJsonFile<T>(content, options);
  } catch (error_) {
    if (isError(error_)) {
      error_.message = error_.message.replace("JSON", path);
      throw error_;
    }

    throw new Error(`Failed to parse JSON: ${path}`);
  }
}

interface YamlReadOptions {
  /**
   * Compatibility with JSON.parse behavior. If true, then duplicate keys in a mapping will override values rather than throwing an error.
   */
  json?: boolean;
}

/**
 * Reads a YAML file and returns the object the YAML content represents.
 *
 * @param path - A path to a file.
 * @returns
 */
export function readYamlFile<T extends object = any>(
  path: string,
  options?: YamlReadOptions
): T {
  const content = readFileSync(path, "utf8");
  const { load } = require("@zkochan/js-yaml");
  return load(content, { ...options, filename: path }) as T;
}

/**
 * Serializes the given data to JSON and writes it to a file.
 *
 * @param path - A path to a file.
 * @param data - data which should be serialized to JSON and written to the file
 * @param options - JSON serialize options
 */
export function writeJsonFile<T extends object = object>(
  path: string,
  data: T,
  options?: JsonWriteOptions
): void {
  mkdirSync(dirname(path), { recursive: true });
  const serializedJson = StormJSON.stringifyJsonFile(data, options);
  const content = options?.appendNewLine
    ? `${serializedJson}\n`
    : serializedJson;
  writeFileSync(path, content, { encoding: "utf8" });
}

/**
 * Serializes the given data to JSON and writes it to a file asynchronously.
 *
 * @param path - A path to a file.
 * @param data - data which should be serialized to JSON and written to the file
 * @param options - JSON serialize options
 */
export async function writeJsonFileAsync<T extends object = object>(
  path: string,
  data: T,
  options?: JsonWriteOptions
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const serializedJson = StormJSON.stringifyJsonFile(data, options);
  const content = options?.appendNewLine
    ? `${serializedJson}\n`
    : serializedJson;
  await writeFile(path, content, { encoding: "utf8" });
}

/**
 * Extracts a file from a given tarball to the specified destination.
 *
 * @param tarballPath - The path to the tarball from where the file should be extracted.
 * @param file - The path to the file inside the tarball.
 * @param destinationFilePath - The destination file path.
 * @returns True if the file was extracted successfully, false otherwise.
 */
export async function extractFileFromTarball(
  tarballPath: string,
  file: string,
  destinationFilePath: string
) {
  return new Promise<string>((resolve, reject) => {
    mkdirSync(dirname(destinationFilePath), { recursive: true });
    var tarExtractStream = tar.extract();
    const destinationFileStream = createWriteStream(destinationFilePath);

    let isFileExtracted = false;
    tarExtractStream.on(
      "entry",
      (
        header: { name: string },
        stream: {
          pipe: (arg0: WriteStream) => void;
          on: (arg0: string, arg1: { (): void; (): void }) => void;
          resume: () => void;
        },
        next: () => void
      ) => {
        if (header.name === file) {
          stream.pipe(destinationFileStream);
          stream.on("end", () => {
            isFileExtracted = true;
          });
          destinationFileStream.on("close", () => {
            resolve(destinationFilePath);
          });
        }

        stream.on("end", () => {
          next();
        });

        stream.resume();
      }
    );

    tarExtractStream.on("finish", () => {
      if (!isFileExtracted) {
        reject();
      }
    });

    createReadStream(tarballPath).pipe(createGunzip()).pipe(tarExtractStream);
  });
}

/**
 * Reads a file if it exists, otherwise returns an empty string.
 *
 * @param path - The path to the file to read.
 * @returns The content of the file if it exists, otherwise an empty string.
 */
export function readFileIfExisting(path: string) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}
