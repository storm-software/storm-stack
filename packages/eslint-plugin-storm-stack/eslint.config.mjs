import { fixupPluginRules } from "@eslint/compat";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import i18nTextPlugin from "eslint-plugin-i18n-text";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  eslintPlugin.configs["flat/all"],
  {
    ignores: ["test-examples/**"]
  },
  {
    languageOptions: {
      ecmaVersion: 13,
      globals: {
        ...globals.es6,
        ...globals.node
      }
    },
    plugins: {
      eslintPlugin,
      import: importPlugin,
      "i18n-text": fixupPluginRules(i18nTextPlugin)
    },
    rules: {
      "import/extensions": "off",
      "import/no-commonjs": "off",
      "i18n-text/no-en": "off",
      "eslint-plugin/prefer-placeholders": "off",
      "eslint-plugin/test-case-shorthand-strings": "off",
      "eslint-plugin/require-meta-docs-url": "off"
    }
  }
];
