import { zodToJsonSchema } from "zod-to-json-schema";
import { getModulesSchema } from "./get-modules-schema";

export const generateJsonSchema = async () =>
  zodToJsonSchema(await getModulesSchema(), "StormConfig");
