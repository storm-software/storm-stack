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

import {
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import { getReflectionsPath } from "@storm-stack/core/helpers/deepkit/resolve-reflections";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { StormJSON } from "@stryke/json/storm-json";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetConfig } from "../types/config";

export async function reflectRequest<TOptions extends Options = Options>(
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

      // eslint-disable-next-line ts/no-unsafe-function-type
      const handle = await resolveType<TOptions, Function>(
        context,
        entry.input
      );
      if (!handle) {
        throw new Error(`Module not found: ${entry.input.file}`);
      }

      const handleReflection = ReflectionFunction.from(handle);
      if (!handleReflection) {
        throw new Error(`Reflection not found: ${entry.input.file}`);
      }

      const parameters = handleReflection.getParameters();
      if (parameters && parameters.length > 0) {
        const parameter = parameters[0];
        if (
          parameter &&
          (parameter.type.kind === ReflectionKind.class ||
            parameter.type.kind === ReflectionKind.objectLiteral)
        ) {
          const parameterReflection = ReflectionClass.from(parameter.type);
          if (parameterReflection.hasProperty("data")) {
            await writeFile(
              log,
              joinPaths(
                getReflectionsPath(context),
                entry.input.file
                  .replace(context.projectRoot, "")
                  .replace(/\.ts$/, ".json")
              ),
              StormJSON.stringify(parameterReflection.serializeType())
            );

            return parameterReflection;
          }
        }
      }

      throw new Error(
        `Could not determine request type for command ${entry.input.file}`
      );
    })
  );
}
