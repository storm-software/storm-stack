import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/plugin-dotenv",
  true,
  "@storm-stack/plugin-dotenv"
);
