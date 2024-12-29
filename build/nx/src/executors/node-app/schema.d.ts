import type { NodeAppBuildOptions } from "@storm-stack/build-core";

export type NodeApplicationExecutorSchema = Partial<
  Pick<NodeAppBuildOptions, "entryPoints" | "outputPath" | "assets" | "debug">
>;
