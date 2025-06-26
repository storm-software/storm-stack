import { defineConfig } from "@storm-stack/core/config";

export default defineConfig({
  name: "Storm Stack",
  plugins: [
    [
      "@storm-stack/plugin-cli",
      {
        bin: ["storm", "storm-stack"]
      }
    ],
    [
      "@storm-stack/plugin-log-storage",
      {
        logLevel: "info"
      }
    ],
    [
      "@storm-stack/plugin-log-sentry",
      {
        logLevel: "error"
      }
    ]
  ],
  dotenv: {
    types: {
      config: "./src/types.ts#StormStackCLIVariables"
    }
  }
});
