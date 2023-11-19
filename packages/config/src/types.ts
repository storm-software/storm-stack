import { wrap, type Infer, type InferIn } from "@decs/typeschema";
import {
  PackageConfigSchema,
  ProjectConfigSchema,
  StormConfigSchema,
  ThemeConfigSchema,
  WorkspaceConfigSchema
} from "./schema";

export type ThemeConfig = Infer<typeof ThemeConfigSchema>;
export type ThemeConfigInput = InferIn<typeof ThemeConfigSchema>;
export const wrapped_ThemeConfig = wrap(ThemeConfigSchema);

export type PackageConfig = Infer<typeof PackageConfigSchema>;
export type PackageConfigInput = InferIn<typeof PackageConfigSchema>;
export const wrapped_PackageConfig = wrap(PackageConfigSchema);

export type ProjectConfig = Infer<typeof ProjectConfigSchema>;
export type ProjectConfigInput = InferIn<typeof ProjectConfigSchema>;
export const wrapped_ProjectConfig = wrap(ProjectConfigSchema);

export type WorkspaceConfig = Infer<typeof WorkspaceConfigSchema>;
export type WorkspaceConfigInput = InferIn<typeof WorkspaceConfigSchema>;
export const wrapped_WorkspaceConfig = wrap(WorkspaceConfigSchema);

export type StormConfig = Infer<typeof StormConfigSchema>;
export type StormConfigInput = InferIn<typeof StormConfigSchema>;
export const wrapped_StormConfig = wrap(StormConfigSchema);
