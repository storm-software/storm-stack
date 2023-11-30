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
      "packages/nx/**/*.ts",
      "packages/nx/**/*.tsx",
      "packages/nx/**/*.js",
      "packages/nx/**/*.jsx"
    ],
    parserOptions: { project: ["packages/nx/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/nx/**/*.ts", "packages/nx/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/nx/**/*.js", "packages/nx/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/nx/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  })),
  {
    "files": [
      "packages/nx/package.json",
      "packages/nx/package.json",
      "packages/nx/executors.json"
    ],
    "languageOptions": {
      "parser": "jsonc-eslint-parser"
    },
    "rules": {
      "@nx/nx-plugin-checks": "error"
    }
  }
];
