import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig(
  "packages/preset-cloudflare-worker",
  true,
  "preset-cloudflare-worker"
);
