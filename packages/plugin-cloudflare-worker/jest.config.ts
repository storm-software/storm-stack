import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/plugin-cloudflare-worker",
  true,
  "plugin-cloudflare-worker"
);
