import fs from "node:fs";
import { StormError } from "@storm-stack/errors";
import { isString } from "@storm-stack/utilities";
import { CachedInputFileSystem, ResolverFactory } from "enhanced-resolve";
import { PluginSystemErrorCode } from "..";

/**
 * Create a resolver factory
 *
 * @param tsconfig - The path to the tsconfig file
 * @returns The resolver factory
 */
export const createResolver = (rootPath?: string): ((request: string) => Promise<string>) => {
  const resolverFactory = ResolverFactory.createResolver({
    fileSystem: new CachedInputFileSystem(fs, 4000),
    extensions: [".js", ".json"],
    descriptionFiles: ["package.json", "plugin.json"]
  });

  return (request: string) => {
    const resolveContext = {
      issuer: rootPath
    };

    return new Promise((resolve, reject) => {
      resolverFactory.resolve(
        resolveContext,
        rootPath ? rootPath : __dirname,
        request,
        {},
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            if (!result || !isString(result)) {
              reject(
                StormError.create({
                  code: PluginSystemErrorCode.module_not_found,
                  message: `Cannot find plugin ${request}`
                })
              );
            }

            resolve(result as string);
          }
        }
      );
    });
  };
};
