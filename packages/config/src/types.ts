import { wrap, type Infer, type InferIn } from "@decs/typeschema";
import {
  ColorConfigSchema,
  PackageConfigSchema,
  ProjectConfigSchema,
  StormConfigSchema
} from "./schema";

export type ColorConfig = Infer<typeof ColorConfigSchema>;
export type ColorConfigInput = InferIn<typeof ColorConfigSchema>;
export const wrapped_ColorConfig = wrap(ColorConfigSchema);

export type PackageConfig = Infer<typeof PackageConfigSchema>;
export type PackageConfigInput = InferIn<typeof PackageConfigSchema>;
export const wrapped_PackageConfig = wrap(PackageConfigSchema);

export type ProjectConfig = Infer<typeof ProjectConfigSchema>;
export type ProjectConfigInput = InferIn<typeof ProjectConfigSchema>;
export const wrapped_ProjectConfig = wrap(ProjectConfigSchema);

export type StormConfig = Infer<typeof StormConfigSchema>;
export type StormConfigInput = InferIn<typeof StormConfigSchema>;
export const wrapped_StormConfig = wrap(StormConfigSchema);
