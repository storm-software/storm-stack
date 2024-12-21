/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { ProjectGraph, ProjectsConfigurations } from "@nx/devkit";
import * as esbuild from "esbuild";
import { WorkspaceTypeAndRoot } from "nx/src/utils/find-workspace-root";

export type ESBuildOptions = Omit<
  esbuild.BuildOptions,
  "outbase" | "outfile"
> & {
  projectRoot: string;
  name?: string;
  emitTypes?: boolean;
  emitMetafile?: boolean;
};

export type ESBuildResult = esbuild.BuildResult;

export type ESBuildResolvedOptions = ESBuildOptions &
  Required<Pick<ESBuildOptions, "name" | "outdir">> & {
    workspaceRoot: WorkspaceTypeAndRoot;
    projectName: string;
    projectGraph: ProjectGraph;
    projectConfigurations: ProjectsConfigurations;
  };
