import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/server-cache",
  true,
  "base-server-cache"
);
