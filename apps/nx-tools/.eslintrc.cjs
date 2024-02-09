// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json"
  },
  overrides: [
    {
      files: ["./package.json", "./generators.json", "./executors.json", "./migrations.json"],
      parser: "jsonc-eslint-parser",
      rules: {
        "@nx/nx-plugin-checks": "error"
      }
    }
  ]
};

module.exports = config;
