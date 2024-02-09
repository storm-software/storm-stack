// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json"
  },
  overrides: [
    {
      files: ["./package.json"],
      parser: "jsonc-eslint-parser",
      rules: {
        "@nx/dependency-checks": [
          "error",
          {
            buildTargets: ["build"],
            ignoredDependencies: ["typescript"]
          }
        ]
      }
    }
  ]
};

module.exports = config;
