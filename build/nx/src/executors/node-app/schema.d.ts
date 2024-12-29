import type { EntryPointsOption } from "@storm-stack/build-core";
import type { AssetGlob } from "@storm-stack/build-tools";

export type Platform = "browser" | "neutral" | "node" | "worker";

export interface NodeApplicationExecutorSchema {
  entryPoints: EntryPointsOption;
  outputPath: string;
  assets: (AssetGlob | string)[];
  debug?: boolean;
}
