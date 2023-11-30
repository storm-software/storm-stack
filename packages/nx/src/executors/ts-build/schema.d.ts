import type { TsupExecutorSchema } from "@storm-software/workspace-tools/src/executors/tsup/schema.d.ts";

export type TsBuildExecutorSchema = Omit<TsupExecutorSchema, "env"> & {
  transports?: string[];
};
