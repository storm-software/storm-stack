import { isSet } from "@storm-software/utilities/type-checks/is-set";
import { isSetString } from "@storm-software/utilities/type-checks/is-set-string";
import {
  getProjectConfigurations,
  getWorkspaceRoot
} from "@storm-software/workspace-tools";
import { existsSync } from "fs";
import path from "path";
import * as z from "zod";
import { ConfigFileSchema } from "../schema";

export type ModuleSchema = {
  name: string;
  schema: z.ZodObject<any>;
};

export const getModulesSchema = async () => {
  const workspaceRoot = getWorkspaceRoot();
  const projectConfigurations = getProjectConfigurations();

  const modules = await Promise.all(
    Object.keys(projectConfigurations).map(async key => {
      if (isSetString(projectConfigurations[key].config)) {
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
          .filter(isSet)
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

  return z
    .union([workspaceSchema, ConfigFileSchema])
    .describe(
      "The values set in the Storm config file. This file is expected to be named `storm.config.js` and be located in the root of the workspace"
    );
};
