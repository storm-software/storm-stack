import type { ExecutorContext } from "@nx/devkit";
import type { StormConfig } from "@storm-software/config-tools";
import { withRunExecutor } from "@storm-software/workspace-tools";
import { StormLog } from "@storm-stack/logging";
import { StormParser } from "@storm-stack/serialization";
import { isFunction, isPrimitive } from "@storm-stack/utilities";
import { removeSync } from "fs-extra";
import type { TamaguiExecutorSchema } from "./schema";

export async function TamaguiExecutorFn(
  options: TamaguiExecutorSchema,
  context: ExecutorContext,
  config?: StormConfig
) {
  const logger = StormLog.create(config, "Storm-Stack Tamagui Executor");
  logger.info("⚡  Running Storm-Stack Tamagui compile executor on the workspace");

  // #region Apply default options

  const executorOptions = options as Record<string, any>;
  logger.debug(`⚙️  Executor options:
  ${Object.keys(executorOptions)
    .map(
      (key) =>
        `${key}: ${
          !executorOptions[key] || isPrimitive(executorOptions[key])
            ? executorOptions[key]
            : isFunction(executorOptions[key])
              ? "<function>"
              : StormParser.stringify(executorOptions[key])
        }`
    )
    .join("\n")}
  `);

  // #endregion Apply default options

  // #region Prepare build context variables

  if (
    !context.projectsConfigurations?.projects ||
    !context.projectName ||
    !context.projectsConfigurations.projects[context.projectName]
  ) {
    throw new Error(
      "The Storm-Stack Tamagui compile process failed because the context is not valid. Please run this command from a workspace."
    );
  }

  // const workspaceRoot = getWorkspaceRoot();
  // const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
  // const sourceRoot = context.projectsConfigurations.projects[context.projectName].sourceRoot;

  // #endregion Prepare build context variables

  // #region Clean output directory

  if (options.clean !== false) {
    logger.info(`🧹 Cleaning output path: ${options.outputPath}`);
    removeSync(options.outputPath);
  }

  // #endregion Clean output directory

  logger.success("🎉  Completed running the Storm-Stack Tamagui compiler executor");

  return {
    success: true
  };
}

export const applyDefaultOptions = (
  options: Partial<TamaguiExecutorSchema>
): TamaguiExecutorSchema => {
  options.entry ??= "{sourceRoot}/index.ts";
  options.outputPath ??= "dist/{projectRoot}";
  options.tsConfig ??= "tsconfig.json";
  options.clean ??= true;

  return options as TamaguiExecutorSchema;
};

export default withRunExecutor<TamaguiExecutorSchema>(
  "Storm-Stack Tamagui compiler",
  TamaguiExecutorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions
    }
  }
);
