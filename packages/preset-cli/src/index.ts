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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/helpers";
import { Preset } from "@storm-stack/core/preset";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import { StormStackNodeFeatures } from "@storm-stack/plugin-node/types/config";
import { listFiles } from "@stryke/fs/list-files";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { isDirectory } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { reflectCommands } from "./helpers/reflect-command";
import type { StormStackCLIPresetConfig } from "./types/config";

export default class StormStackCLIPreset<
  TOptions extends Options = Options
> extends Preset<TOptions> {
  #config: StormStackCLIPresetConfig;

  public constructor(config: Partial<StormStackCLIPresetConfig> = {}) {
    super("cli", "@storm-stack/preset-cli");

    this.#config = {
      features: [],
      ...config
    };
    this.dependencies = [
      ["@storm-stack/plugin-node", { features: this.#config.features }]
    ];
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initContext.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "prepare:entry": this.prepareEntry.bind(this)
    });
  }

  protected async initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    if (
      context.projectType === "application" &&
      isSetString(context.entry) &&
      isDirectory(context.entry)
    ) {
      const files = (await listFiles(joinPaths(context.entry, "**/*"))).map(
        file =>
          file.replace(
            `${joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.entry as string
            )}/`,
            ""
          )
      );
      if (files.length === 0) {
        this.log(
          LogLevelLabel.WARN,
          `No commands could be found in ${context.entry}. Please ensure this is correct.`
        );
      } else {
        this.log(
          LogLevelLabel.TRACE,
          `The following commands were found in the entry directory: ${files.join(
            ", "
          )}`
        );

        context.resolvedEntry = files.map(file => ({
          file: joinPaths(context.projectRoot, context.artifactsDir, file),
          input: { file: joinPaths(context.entry as string, file) }
        }));
      }
    }

    // const binaryName =
    //   this.#config.binaryName || kebabCase(context.name || "cli");
    // context.artifactsDir = joinPaths(
    //   context.projectRoot,
    //   this.#config.binaryPath
    // );
    // context.runtimeDir = joinPaths(context.artifactsDir, "runtime");
    // context.resolvedEntry = context.resolvedEntry.map(entry => ({
    //   ...entry,
    //   file: joinPaths(this.#config.binaryPath, entry.file)
    // }));
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(context, "@stryke/cli"),
        context.projectType === "application" &&
          this.install(context, "@storm-stack/log-storage"),
        context.projectType === "application" &&
          this.install(context, "consola")
      ].filter(Boolean)
    );
  }

  protected async prepareEntry(context: Context<TOptions>) {
    try {
      await reflectCommands(this.log, context, this.#config);

      for (const entry of context.resolvedEntry) {
        this.log(
          LogLevelLabel.TRACE,
          `Preparing the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
        );

        await this.writeFile(
          entry.file,
          `${getFileHeader()}

import ".${joinPaths(context.runtimeDir.replace(context.artifactsDir, ""), "init")}";

import ${entry.input.name ? `{ ${entry.input.name} as handle }` : "handle"} from "${joinPaths(
            relativePath(
              findFilePath(entry.file),
              findFilePath(entry.input.file)
            ),
            findFileName(entry.input.file).replace(
              findFileExtension(entry.input.file),
              ""
            )
          )}";
import { builder } from ".${joinPaths(context.runtimeDir.replace(context.artifactsDir, ""), "app")}";
import { storage } from ".${joinPaths(context.runtimeDir.replace(context.artifactsDir, ""), "storage")}";
import { getSink as getStorageSink } from "@storm-stack/log-storage";${
            this.#config.features?.includes(StormStackNodeFeatures.SENTRY)
              ? `
import { getSink as getSentrySink } from "@storm-stack/log-sentry";`
              : ""
          }

export default builder({
  name: ${context.name ? `"${context.name}"` : "undefined"},
  log: [
    { handle: await getStorageSink({ storage }), logLevel: "debug" }${
      this.#config.features.includes(StormStackNodeFeatures.SENTRY)
        ? `,
    { handle: getSentrySink(), logLevel: "error" }`
        : ""
    }
  ],
  storage
})
  .handler(handle)
  .build();

/*
const dev = defineCommand({
  meta: {
    name: 'dev',
    version: version,
    description: 'Start the dev server',
  },
  args: {
    clean: {
      type: 'boolean',
    },
    host: {
      type: 'string',
    },
    port: {
      type: 'string',
    },
    https: {
      type: 'boolean',
    },
    mode: {
      type: 'string',
      description:
        'If set to "production" you can run the development server but serve the production bundle',
    },
    'debug-bundle': {
      type: 'string',
      description: "Will output the bundle to a temp file and then serve it from there afterwards allowing you to easily edit the bundle to debug problems.",
    },
    debug: {
      type: 'string',
      description: "Pass debug args to Vite",
    },
  },
  async run({ args }) {
    const { dev } = await import('./cli/dev')
    await dev({
      ...args,
      debugBundle: args['debug-bundle'],
      mode: modes[args.mode],
    })
  },
})
  */


`
        );
      }
    } catch (error) {
      this.log(
        LogLevelLabel.ERROR,
        `Failed to prepare the entry artifact: ${error?.message}`
      );
      throw error;
    }
  }
}
