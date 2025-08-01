import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/plugin-crypto",
  true,
  "@storm-stack/plugin-crypto"
);
