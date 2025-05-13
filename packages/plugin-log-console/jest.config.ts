import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/plugin-log-console",
  true,
  "@storm-stack/plugin-log-console"
);
