module.exports = {
  name: "storm-stack",
  namespace: "storm-stack",
  organization: "storm-software",
  ci: true,
  owner: "@storm-software/development",
  worker: "stormie-bot",
  workspaceRoot: "C:\\Development\\storm-stack",
  runtimeDirectory: "node_modules/.storm",
  repository: "https://github.com/storm-software/storm-stack",
  timezone: "America/New_York",
  locale: "en-US",
  logLevel: "trace",
  colors: {
    primary: "#1fb2a6",
    background: "#1d232a",
    success: "#087f5b",
    info: "#0ea5e9",
    warning: "#fcc419",
    error: "#990000",
    fatal: "#7d1a1a"
  },
  extensions: {
    logging: {
      fileName: "storm",
      fileExtension: "log",
      path: "tmp/storm/logs",
      stacktrace: true
    }
  }
};
