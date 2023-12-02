import { ExecutorContext } from "@nx/devkit";
import { tsupExecutor } from "@storm-software/workspace-tools";
import esbuildPluginPino from "esbuild-plugin-pino";
import { withRunExecutor } from "../../base/base-executor";
import { getFileBanner } from "../../utilities/get-file-banner";
import { TsBuildExecutorSchema } from "./schema";

export const tsBuildExecutorFn = async (
  options: TsBuildExecutorSchema,
  context: ExecutorContext,
  config?: any
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
      banner: getFileBanner(
        context.projectName
          ? context.projectName
              .split(/(?=[A-Z])|[\.\-\s_]/)
              .map(s => s.trim())
              .filter(s => !!s)
              .map(s =>
                s ? s.toUpperCase()[0] + s.toLowerCase().slice(1) : ""
              )
              .join(" ")
          : "TypeScript"
      ),
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
