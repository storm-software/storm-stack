const { FlatCompat } = require("@eslint/eslintrc");
const baseConfig = require("../../eslint.config.js");
const js = require("@eslint/js");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});
module.exports = [
  ...baseConfig,
  {
    files: [
      "packages/utilities/**/*.ts",
      "packages/utilities/**/*.tsx",
      "packages/utilities/**/*.js",
      "packages/utilities/**/*.jsx"
    ],
    parserOptions: { project: ["packages/utilities/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/utilities/**/*.ts", "packages/utilities/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/utilities/**/*.js", "packages/utilities/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/utilities/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
