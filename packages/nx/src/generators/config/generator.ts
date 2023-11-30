import { Tree, writeJson } from "@nx/devkit";
import { StormConfig } from "@storm-software/config/types";
import { generateJsonSchema } from "@storm-software/config/utilities/generate-json-schema";
import { withRunGenerator } from "../../base/base-generator";
import { ConfigGeneratorSchema } from "./schema";

export default withRunGenerator<ConfigGeneratorSchema>(
  "Configuration Schema",
  async (tree: Tree, options: ConfigGeneratorSchema, config?: StormConfig) => {
    writeJson(tree, options.outputFile, await generateJsonSchema());

    return null;
  }
);
