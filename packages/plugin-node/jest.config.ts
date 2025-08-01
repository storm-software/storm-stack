import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/plugin-node",
  true,
  "@storm-stack/plugin-node"
);
