import type { TsupExecutorSchema } from "@storm-software/workspace-tools/src/executors/tsup/schema";

export interface TamaguiExecutorSchema extends TsupExecutorSchema {
  clientPlatform: "native" | "web" | "both";
}
