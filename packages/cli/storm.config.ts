export default {
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
  skipCache: true,
  dotenv: {
    types: {
      config: "./src/types.ts#StormStackCLIVariables"
    }
  }
};
