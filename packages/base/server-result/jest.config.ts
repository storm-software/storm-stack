import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/server-result",
  true,
  "base-server-result"
);