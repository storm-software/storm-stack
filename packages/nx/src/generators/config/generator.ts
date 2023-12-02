import { Tree, writeJson } from "@nx/devkit";
import {
  getProjectConfigurations,
  getWorkspaceRoot
} from "@storm-software/workspace-tools";
import { existsSync } from "fs";
import path, { join } from "path";
import * as z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { withRunGenerator } from "../../base/base-generator";
import { ConfigGeneratorSchema } from "./schema";

export type ModuleSchema = {
  name: string;
  schema: z.ZodObject<any>;
};

export default withRunGenerator<ConfigGeneratorSchema>(
  "Configuration Schema",
  async (tree: Tree, options: ConfigGeneratorSchema) => {
    const workspaceRoot = getWorkspaceRoot();
    const projectConfigurations = getProjectConfigurations();

    if (!projectConfigurations.config?.sourceRoot) {
      throw new Error(
        `No config project exists in the workspace. This executor is only meant to run in the Storm-Stack monorepo.`
      );
    }
    const configMod = await import(
      join(workspaceRoot, projectConfigurations.config?.sourceRoot, "schema.ts")
    );
    if (!configMod.ConfigFileSchema) {
      throw new Error(
        `No ConfigFileSchema exists in the config project. This executor is only meant to run in the Storm-Stack monorepo.`
      );
    }

    const ConfigFileSchema = configMod.ConfigFileSchema;
    const modules = await Promise.all(
      Object.keys(projectConfigurations).map(async key => {
        if (projectConfigurations[key].config) {
          const configPath = path.join(
            workspaceRoot,
            projectConfigurations[key].config
          );
          if (existsSync(configPath)) {
            const mod = await import(configPath);
            if (mod.default) {
              return { name: key, schema: mod.default } as ModuleSchema;
            }
          }
        }

        return null;
      })
    );

    const workspaceSchema = z.object({
      modules: z
        .object(
          modules
            .filter(module => !!module)
            .reduce(
              (
                ret: Record<string, z.ZodObject<any>>,
                module: ModuleSchema | null
              ) => {
                if (module?.schema && !ret[module.name]) {
                  ret[module.name] = module.schema;
                }

                return ret;
              },
              {}
            )
        )
        .describe("Configuration of each used extension")
    });

    const ModulesSchema = z
      .union([workspaceSchema, ConfigFileSchema])
      .describe(
        "The values set in the Storm config file. This file is expected to be named `storm.config.js` and be located in the root of the workspace"
      );

    writeJson(
      tree,
      options.outputFile,
      zodToJsonSchema(ModulesSchema, "StormConfig")
    );

    return null;
  }
);
