module.exports = {
  name: "storm-stack",
  namespace: "storm-stack",
  organization: "storm-software",
  preMajor: false,
  owner: "@storm-software/development",
  worker: "stormie-bot",
  workspaceRoot: "C:\\Development\\storm-ops",
  runtimeDirectory: "node_modules/.storm",
  timezone: "America/New_York",
  locale: "en-US",
  logLevel: "info",
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
