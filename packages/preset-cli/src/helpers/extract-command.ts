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

// import { CompilerContext } from "@deepkit/core";

import {
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind,
  serializeType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { LogFn } from "@storm-stack/core/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { bundle } from "@storm-stack/plugin-node/helpers/bundle";
import { findFileExtension, findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetConfig } from "../types/config";

export async function extractCommand<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  _config: StormStackCLIPresetConfig
) {
  // const compiler = new CompilerContext();

  return Promise.all(
    context.resolvedEntry.map(async entry => {
      log(
        LogLevelLabel.TRACE,
        `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
      );

      const transpilePath = joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.projectRoot,
        context.artifactsDir,
        "reflection"
      );

      const transpileFile = joinPaths(
        transpilePath,
        findFileName(entry.input.file).replace(
          findFileExtension(entry.input.file),
          ""
        )
      );

      // const content = await readFile(
      //   joinPaths(context.workspaceConfig.workspaceRoot, entry.input.file)
      // );
      // const compiled = await context.compiler.compile(
      //   context,
      //   entry.input.file,
      //   content
      // );
      // await writeFile(log, transpileFile, compiled);

      //       await writeFile(
      //         `${transpileFile}.ts`,
      //         `${getFileHeader()}
      // import ${entry.input.name ? `{ ${entry.input.name} as handle }` : "handle"} from "${joinPaths(
      //           relativePath(transpilePath, findFilePath(entry.input.file)),
      //           findFileName(entry.input.file).replace(
      //             findFileExtension(entry.input.file),
      //             ""
      //           )
      //         )}";
      // import { ReflectionFunction } from "@deepkit/type";

      // export default ReflectionFunction.from(handle);

      // `
      //       );

      const result = await bundle(
        context,
        joinPaths(context.workspaceConfig.workspaceRoot, entry.input.file),
        transpilePath,
        {
          write: true
        }
      );
      if (result.errors.length > 0) {
        log(
          LogLevelLabel.ERROR,
          `Failed to transpile ${transpileFile}: ${result.errors
            .map(error => error.text)
            .join(", ")}`
        );
        return;
      }

      if (result.warnings.length > 0) {
        log(
          LogLevelLabel.WARN,
          `Warnings while transpiling ${transpileFile}: ${result.warnings
            .map(warning => warning.text)
            .join(", ")}`
        );
      }

      const module = await context.resolver.import<{
        // eslint-disable-next-line ts/no-unsafe-function-type
        default: Function;
      }>(context.resolver.esmResolve(`${transpileFile}.js`));
      if (!module) {
        log(LogLevelLabel.ERROR, `Module not found: ${transpileFile}`);
        return;
      }

      const handleReflection = ReflectionFunction.from(module.default);
      if (!handleReflection) {
        log(LogLevelLabel.ERROR, `Reflection not found: ${transpileFile}`);
        return;
      }

      const parameters = handleReflection.getParameters();
      if (parameters && parameters.length > 0) {
        const parameter = parameters[0];
        if (
          parameter &&
          (parameter.type.kind === ReflectionKind.class ||
            parameter.type.kind === ReflectionKind.object)
        ) {
          const parameterReflection = ReflectionClass.from(parameter.type);
          if (parameterReflection.hasProperty("data")) {
            const request = parameterReflection.getProperty("data");

            log(
              LogLevelLabel.ERROR,
              !request
                ? `No requestType found for command ${entry.input.file}`
                : JSON.stringify(serializeType(request.getType()))
            );

            return;
          }
        }
      }

      log(LogLevelLabel.ERROR, `requestType not found: ${entry.input.file}`);
    })
  );
}
