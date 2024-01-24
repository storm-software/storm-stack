import fs from "node:fs";
import { StormError } from "@storm-stack/errors";
import { joinPaths, loadTsConfigFile } from "@storm-stack/file-system";
import { isString } from "@storm-stack/utilities";
import { CachedInputFileSystem, ResolverFactory } from "enhanced-resolve";
import { PluginSystemErrorCode } from "..";
import { install } from "./run";

/**
 * Create a resolver factory
 *
 * @param tsconfig - The path to the tsconfig file
 * @returns The resolver factory
 */
export const createResolver = (
  rootPath: string = __dirname,
  tsconfig = "tsconfig.json",
  autoInstall = true
): ((request: string) => Promise<string>) => {
  const tsconfigJson = loadTsConfigFile(
    tsconfig.includes(rootPath) ? tsconfig : joinPaths(rootPath, tsconfig)
  );

  const resolverFactory = ResolverFactory.createResolver({
    alias: tsconfigJson?.data?.compilerOptions?.paths,
    fileSystem: new CachedInputFileSystem(fs, 4000),
    extensions: [".js", ".cjs", ".mjs", ".jsx", ".json", ".node", ".ts", ".tsx"],
    mainFields: ["main", "module"],
    mainFiles: ["index"],
    descriptionFiles: ["package.json"]
  });

  return (request: string) => {
    const resolveContext = {
      issuer: rootPath
    };

    return new Promise((resolve, reject) => {
      resolverFactory.resolve(resolveContext, rootPath, request, {}, (error, result) => {
        if (error || !result || !isString(result)) {
          if (autoInstall) {
            install(request, rootPath).then(() => {
              resolverFactory.resolve(
                resolveContext,
                rootPath,
                request,
                {},
                (innerError, innerResult) => {
                  if (innerError) {
                    reject(innerError);
                  } else if (!innerResult || !isString(innerResult)) {
                    reject(
                      StormError.create({
                        code: PluginSystemErrorCode.module_not_found,
                        message: `Cannot find plugin ${request}`
                      })
                    );
                  } else {
                    resolve(innerResult as string);
                  }
                }
              );
              resolve(result as string);
            });
          }

          if (error) {
            reject(error);
          } else {
            reject(
              StormError.create({
                code: PluginSystemErrorCode.module_not_found,
                message: `Cannot find plugin ${request}`
              })
            );
          }
        } else {
          resolve(result as string);
        }
      });
    });
  };
};
