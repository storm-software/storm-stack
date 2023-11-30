import { ExecutorContext } from "@nx/devkit";
import { StormConfig } from "@storm-software/config";
import { titleCase } from "@storm-software/utilities";
import { tsupExecutor } from "@storm-software/workspace-tools";
import esbuildPluginPino from "esbuild-plugin-pino";
import { withRunExecutor } from "../../base/base-executor";
import { getFileBanner } from "../../utilities/get-file-banner";
import { TsBuildExecutorSchema } from "./schema";

export const tsBuildExecutorFn = async (
  options: TsBuildExecutorSchema,
  context: ExecutorContext,
  config?: StormConfig
) => {
  options.plugins ??= [];
  options.transports ??= ["pino-pretty"];

  if (
    options.transports &&
    Array.isArray(options.transports) &&
    options.transports.length > 0
  ) {
    options.plugins.push(esbuildPluginPino({ transports: options.transports }));
  }

  return tsupExecutor(
    {
      ...options,
      banner: getFileBanner(titleCase(context.projectName ?? "TypeScript")!),
      define: {
        ...options.define,
        "__STORM_CONFIG": config
      },
      env: {
        __STORM_CONFIG: config,
        ...process.env
      }
    },
    context
  );
};

export default withRunExecutor<TsBuildExecutorSchema>(
  "TypeScript Build",
  tsBuildExecutorFn
);
