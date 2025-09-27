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
  Extractor,
  ExtractorConfig,
  ExtractorResult
} from "@microsoft/api-extractor";
import {
  writeDebug,
  writeError,
  writeFatal,
  writeInfo,
  writeSuccess
} from "@storm-software/config-tools/logger";
import { existsSync } from "@stryke/fs/exists";
import { readFile } from "@stryke/fs/read-file";
import { writeFile } from "@stryke/fs/write-file";
import { joinPaths } from "@stryke/path/join-paths";

const currentWorkingDir = process.argv[2] || process.cwd();

async function extractRuntimeDts(runtime: "shared" | "node" | "browser") {
  const runtimeTypesFilePath = joinPaths(
    currentWorkingDir,
    "dist",
    "runtime-types",
    "esm"
  );

  writeInfo(
    `storm-stack@build-runtime-types: Running API Extractor for ${runtime} runtime at ${runtimeTypesFilePath}`,
    {
      logLevel: "all"
    }
  );

  const mainEntryPointFilePath = joinPaths(
    runtimeTypesFilePath,
    runtime === "shared" ? "index.d.ts" : joinPaths(runtime, "index.d.ts")
  );
  if (!existsSync(mainEntryPointFilePath)) {
    throw new Error(
      `Could not resolve @storm-stack/core/runtime-types package location: ${mainEntryPointFilePath} does not exist.`
    );
  }

  const untrimmedFilePath = joinPaths(
    runtimeTypesFilePath,
    "..",
    `${runtime}.d.ts`
  );

  const extractorResult: ExtractorResult = Extractor.invoke(
    ExtractorConfig.prepare({
      configObject: {
        mainEntryPointFilePath,
        apiReport: {
          enabled: false,

          // `reportFileName` is not been used. It's just to fit the requirement of API Extractor.
          reportFileName: "report.api.md"
        },
        docModel: { enabled: false },
        dtsRollup: {
          enabled: true,
          untrimmedFilePath
        },
        tsdocMetadata: { enabled: false },
        compiler: {
          tsconfigFilePath: joinPaths(currentWorkingDir, "tsconfig.json")
        },
        projectFolder: currentWorkingDir,
        newlineKind: "lf"
      },
      configObjectFullPath: undefined,
      packageJsonFullPath: joinPaths(currentWorkingDir, "package.json")
    }),
    {
      localBuild: true,
      showVerboseMessages: true
    }
  );
  if (!extractorResult.succeeded) {
    throw new Error(
      `API Extractor completed with ${extractorResult.errorCount} errors and ${
        extractorResult.warningCount
      } warnings when processing @storm-stack/core/runtime-types package.`
    );
  }

  const dtsFileContent = await readFile(untrimmedFilePath);
  await writeFile(
    untrimmedFilePath,
    dtsFileContent
      .replace(/\s*export.*__Ω.*;/g, "")
      .replace(/^export\s*\{\s*\}\s*$/gm, "")
      .replace(/^export\s*(?:declare\s*)?interface\s*/gm, "interface ")
      .replace(/^export\s*(?:declare\s*)?type\s*/gm, "type ")
      .replace(/^export\s*(?:declare\s*)?const\s*/gm, "declare const ")
      .replace(
        /: Storage(?:_\d+)?;$/gm,
        ': import("unstorage").Storage<import("unstorage").StorageValue>;'
      )
  );

  writeSuccess(
    `storm-stack@build-runtime-types: Generated TypeScript declaration file for ${runtime} runtime.`,
    {
      logLevel: "all"
    }
  );
}

// The post install is not critical, to avoid any chance that it may hang
// we will kill this process after 30 seconds.
const postinstallTimeout = setTimeout(() => {
  writeError("storm-stack@build-runtime-types: Timeout reached.", {
    logLevel: "all"
  });
  process.exit(0);
}, 30_000);

// eslint-disable-next-line ts/no-floating-promises
(async () => {
  const start = new Date();
  try {
    await Promise.all([
      extractRuntimeDts("shared"),
      extractRuntimeDts("node"),
      extractRuntimeDts("browser")
    ]);

    writeSuccess(
      "storm-stack@build-runtime-types: All runtime type declarations extracted successfully.",
      { logLevel: "all" }
    );
  } catch (e) {
    writeError(
      `storm-stack@build-runtime-types: Exception occurred - ${(e as Error)?.message}`,
      { logLevel: "all" }
    );
  } finally {
    const end = new Date();
    writeDebug(
      `storm-stack@build-runtime-types: Process took ${end.getTime() - start.getTime()}ms`,
      { logLevel: "all" }
    );

    clearTimeout(postinstallTimeout);
    process.exit(0);
  }
})();

process.on("uncaughtException", e => {
  writeFatal(
    `storm-stack@build-runtime-types: Uncaught Exception occurred - ${e.message}`,
    { logLevel: "all" }
  );
  process.exit(0);
});

process.on("unhandledRejection", e => {
  writeFatal(
    `storm-stack@build-runtime-types: Unhandled Rejection occurred - ${(e as Error)?.message}`,
    { logLevel: "all" }
  );
  process.exit(0);
});
