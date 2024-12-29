import * as baseConfig from "@storm-software/linting-tools/syncpack/config.json";

/** @type {import("syncpack").RcFile} */
export const config = {
  ...baseConfig,
  formatRepository: true,
  formatBugs: true,
  customTypes: {
    ...baseConfig.customTypes,
    nodeEngine: {
      path: "engines.node",
      strategy: "version"
    },
    pnpmOverrides: {
      path: "pnpm.overrides",
      strategy: "versionsByName"
    }
  },
  source: [
    ...baseConfig.source,
    "tools/*/package.json",
    "build/*/package.json",
    "packages/**/package.json",
    "apps/*/package.json"
  ],
  versionGroups: [
    ...baseConfig.versionGroups,
    {
      label:
        "Dependencies should all use the same version of typescript and tsup",
      dependencies: ["tsup"],
      pinVersion: ["8.3.5"]
    },
    {
      label:
        "Dependencies should all use the same version of typescript and tsup",
      dependencies: ["typescript"],
      snapTo: ["@storm-stack/monorepo"]
    },
    {
      label:
        "Build related dependencies should all use the version specified in build-core",
      dependencies: ["@microsoft/api-extractor", "esbuild"],
      snapTo: ["@storm-stack/build-core"]
    },
    {
      label: "Nx Dependencies should all use the same version",
      dependencies: ["@nx/**", "nx"],
      snapTo: ["@storm-stack/monorepo"]
    },
    {
      label:
        "Ensure semver ranges for locally developed packages satisfy the local version",
      dependencies: ["$LOCAL"],
      dependencyTypes: ["dev", "peer"],
      policy: "sameRange"
    }
  ]
};
