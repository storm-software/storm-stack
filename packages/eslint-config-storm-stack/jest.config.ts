import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/eslint-config",
  true,
  "eslint-config-storm-stack"
);
