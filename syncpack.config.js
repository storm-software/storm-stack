import * as baseConfig from "@storm-software/linting-tools/syncpack/config.json";

/** @type {import("syncpack").RcFile} */
export const config = {
  ...baseConfig,
  source: [...baseConfig.source, "build/*/package.json"],
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
      label: "Nx Dependencies should all use the same version",
      dependencies: ["@nx/**", "nx"],
      snapTo: ["@storm-stack/monorepo"]
    },
    {
      label:
        "All local dependencies should use the current workspace's version",
      dependencies: ["@storm-stack/**"],
      pinVersion: ["workspace:*"]
    }
  ]
};
