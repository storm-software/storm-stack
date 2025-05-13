/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { writeFile } from "../../helpers/utilities/write-file";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import {
  generateNodeDeclarations,
  generateNodeGlobal,
  generateNodeModules
} from "./dts/node";
import {
  generateSharedDeclarations,
  generateSharedGlobal,
  generateSharedModules
} from "./dts/shared";

export async function prepareTypes<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the type declarations for the Storm Stack project.`
  );

  const typesDir = joinPaths(
    context.options.projectRoot,
    context.artifactsDir,
    "types"
  );
  const relativeRuntimePath = relativePath(
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      "types"
    ),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      "runtime"
    )
  );

  const promises = [] as Promise<void>[];
  if (context.dotenv.types.variables.reflection) {
    if (context.options.platform === "node") {
      promises.push(
        writeFile(
          log,
          joinPaths(typesDir, "context.d.ts"),
          generateNodeDeclarations(context.dotenv.types.variables, context)
        )
      );
    } else {
      promises.push(
        writeFile(
          log,
          joinPaths(typesDir, "vars.d.ts"),
          generateSharedDeclarations(context.dotenv.types.variables)
        )
      );
    }
  }

  promises.push(
    writeFile(
      log,
      joinPaths(typesDir, "global.d.ts"),
      generateSharedGlobal(relativeRuntimePath)
    )
  );
  promises.push(
    writeFile(
      log,
      joinPaths(typesDir, "modules.d.ts"),
      generateSharedModules(relativeRuntimePath)
    )
  );

  if (context.options.platform === "node") {
    promises.push(
      writeFile(
        log,
        joinPaths(typesDir, "global-node.d.ts"),
        generateNodeGlobal(relativeRuntimePath, context)
      )
    );
    promises.push(
      writeFile(
        log,
        joinPaths(typesDir, "modules-node.d.ts"),
        generateNodeModules(relativeRuntimePath, context)
      )
    );
  }

  await Promise.all(promises);

  await hooks.callHook("prepare:types", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while preparing the type declarations for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the type declarations for the Storm Stack project",
      { cause: error }
    );
  });
}
