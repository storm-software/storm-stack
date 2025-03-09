import type { ESLint } from "eslint";
import { version } from "../package.json" with { type: "json" };
import asyncPreventDefault from "./rules/async-prevent-default";
import authenticityToken from "./rules/authenticity-token";
import consistentListNewline from "./rules/consistent-list-newline";
import ifNewline from "./rules/if-newline";
import importDedupe from "./rules/import-dedupe"; // Ensure this file exists and is correctly named
import noImplicitBuggyGlobals from "./rules/no-implicit-buggy-globals";
import noImportDist from "./rules/no-import-dist";
import noImportNodeModulesByPath from "./rules/no-import-node-modules-by-path";
import noTsExportEqual from "./rules/no-ts-export-equal";
import topLevelFunctions from "./rules/top-level-functions";

export const plugin = {
  meta: {
    name: "storm-stack",
    version
  },
  rules: {
    "async-prevent-default": asyncPreventDefault,
    "authenticity-token": authenticityToken,
    "consistent-list-newline": consistentListNewline,
    "no-implicit-buggy-globals": noImplicitBuggyGlobals,
    "if-newline": ifNewline,
    "import-dedupe": importDedupe,
    "indent-unindent": authenticityToken,
    "no-import-dist": noImportDist,
    "no-import-node-modules-by-path": noImportNodeModulesByPath,
    "no-ts-export-equal": noTsExportEqual,
    "top-level-functions": topLevelFunctions
  }
} satisfies ESLint.Plugin;
