import fs from "node:fs";
import { StormError } from "@storm-stack/errors";
import { joinPaths, loadTsConfigFile } from "@storm-stack/file-system";
import { isString } from "@storm-stack/utilities";
import { CachedInputFileSystem, ResolverFactory } from "enhanced-resolve";
import { PluginSystemErrorCode } from "..";

/**
 * Create a resolver factory
 *
 * @param tsconfig - The path to the tsconfig file
 * @returns The resolver factory
 */
export const createResolver = (
  rootPath: string = __dirname,
  tsconfig = "tsconfig.json"
): ((request: string) => Promise<string>) => {
  const tsconfigJson = loadTsConfigFile(
    tsconfig.includes(rootPath) ? tsconfig : joinPaths(rootPath, tsconfig)
  );

  const resolverFactory = ResolverFactory.createResolver({
    alias: tsconfigJson?.data?.compilerOptions?.paths,
    fileSystem: new CachedInputFileSystem(fs, 4000),
    extensions: [".js", ".json"],
    descriptionFiles: ["package.json", "plugin.json"]
  });

  return (request: string) => {
    const resolveContext = {
      issuer: rootPath
    };

    return new Promise((resolve, reject) => {
      resolverFactory.resolve(resolveContext, rootPath, request, {}, (error, result) => {
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
      });
    });
  };
};
