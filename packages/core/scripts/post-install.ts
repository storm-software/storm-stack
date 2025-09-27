#!/usr/bin/env node
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

/**
 * This script installs the deepkit/type transformer (that extracts automatically types and adds the correct \@t decorator) to the typescript node_modules.
 *
 * The critical section that needs adjustment is in the `function getScriptTransformers` in `node_modules/typescript/lib/tsc.js`.
 */

import {
  writeDebug,
  writeError,
  writeFatal,
  writeInfo,
  writeSuccess
} from "@storm-software/config-tools/logger";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const currentWorkingDir = process.argv[2] || process.cwd();

function getPatchId(id: string): string {
  return `deepkit_type_patch_${id}`;
}

function getCode(deepkitDistPath: string, varName: string, id: string): string {
  return `
  //${getPatchId(id)}

  try {
    var typeTransformer;

    try {
      typeTransformer = require("@storm-stack/core/deepkit/type-compiler");
    } catch (error) {
      typeTransformer = require(${JSON.stringify(deepkitDistPath)});
    }

    if (typeTransformer) {
      if (!customTransformers) {
        ${varName} = {};
      }

      if (!${varName}.before) {
        ${varName}.before = [];
      }

      let alreadyPatched = false;
      for (let fn of ${varName}.before) {
        if (fn && fn.name === "deepkitTransformer") {
          alreadyPatched = true;
        }
      }

      if (!alreadyPatched) {
        if (!${varName}.before.includes(typeTransformer.transformer)) {
          ${varName}.before.push(typeTransformer.transformer);
        }

        if (!${varName}.afterDeclarations) {
          ${varName}.afterDeclarations = [];
        }

        if (!${varName}.afterDeclarations.includes(typeTransformer.declarationTransformer)) {
          ${varName}.afterDeclarations.push(typeTransformer.declarationTransformer);
        }
      }
    }
  } catch {
    // Do nothing
  }

  //${getPatchId(id)}-end
`;
}

function isPatched(code: string, id: string) {
  return code.includes(getPatchId(id));
}

function patchGetTransformers(deepkitDistPath: string, code: string): string {
  const id = "patchGetTransformers";
  if (isPatched(code, id)) {
    return "";
  }

  const find = /function getTransformers\([^)]+\)\s*\{/;
  if (!code.match(find)) {
    return "";
  }

  code = code.replace(find, substring => {
    return `${substring}\n    ${getCode(deepkitDistPath, "customTransformers", id)}`;
  });

  return code;
}

// The post install is not critical, to avoid any chance that it may hang
// we will kill this process after 30 seconds.
const postinstallTimeout = setTimeout(() => {
  writeError("storm-stack@post-install: Timeout reached.", { logLevel: "all" });
  process.exit(0);
}, 30_000);

// eslint-disable-next-line ts/no-floating-promises
(async () => {
  const start = new Date();
  try {
    writeInfo(
      "storm-stack@post-install: Patching TypeScript package with Deepkit transformer",
      {
        logLevel: "all"
      }
    );

    const typeScriptPath = dirname(
      require.resolve("typescript", { paths: [join(currentWorkingDir, "..")] })
    );
    const deepkitDistPath = relative(typeScriptPath, __dirname);

    const paths = ["tsc.js", "_tsc.js", "typescript.js"];

    for (const fileName of paths) {
      const file = join(typeScriptPath, fileName);
      if (!existsSync(file)) {
        continue;
      }

      const content = patchGetTransformers(
        deepkitDistPath,
        await readFile(file, "utf8")
      );

      if (!content) {
        continue;
      }

      await writeFile(file, content);

      writeSuccess(
        `storm-stack@post-install: Injected Deepkit TypeScript transformer at ${file}`,
        { logLevel: "all" }
      );
    }
  } catch (e) {
    writeError(
      `storm-stack@post-install: Exception occurred - ${(e as Error)?.message}`,
      { logLevel: "all" }
    );
  } finally {
    const end = new Date();
    writeDebug(
      `storm-stack@post-install: Process took ${end.getTime() - start.getTime()}ms`,
      { logLevel: "all" }
    );

    clearTimeout(postinstallTimeout);
    process.exit(0);
  }
})();

process.on("uncaughtException", e => {
  writeFatal(
    `storm-stack@post-install: Uncaught Exception occurred - ${e.message}`,
    { logLevel: "all" }
  );
  process.exit(0);
});

process.on("unhandledRejection", e => {
  writeFatal(
    `storm-stack@post-install: Unhandled Rejection occurred - ${(e as Error)?.message}`,
    { logLevel: "all" }
  );
  process.exit(0);
});
