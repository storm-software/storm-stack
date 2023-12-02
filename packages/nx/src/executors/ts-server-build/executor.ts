import { ExecutorContext } from "@nx/devkit";
import { withRunExecutor } from "../../base/base-executor";
import { tsBuildExecutorFn } from "../ts-build/executor";
import { TsServerBuildExecutorSchema } from "./schema";

export default withRunExecutor<TsServerBuildExecutorSchema>(
  "TypeScript Server Build",
  async (
    options: TsServerBuildExecutorSchema,
    context: ExecutorContext,
    config?: any
  ) => {
    options.platform ??= "node";

    return tsBuildExecutorFn(
      {
        transports: ["pino-pretty", "pino-loki"],
        ...options
      },
      context,
      config
    );
  }
);
