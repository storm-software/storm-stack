import type * as z from "zod";
import type { TelemetryConfigSchema } from "./schema";

export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;
