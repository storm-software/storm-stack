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
      "packages/date-time/**/*.ts",
      "packages/date-time/**/*.tsx",
      "packages/date-time/**/*.js",
      "packages/date-time/**/*.jsx"
    ],
    parserOptions: { project: ["packages/date-time/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/date-time/**/*.ts", "packages/date-time/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/date-time/**/*.js", "packages/date-time/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/date-time/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
