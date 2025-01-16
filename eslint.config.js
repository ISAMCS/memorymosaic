// filepath: /Users/isabellamarquez/Documents/GitHub/memorymosaic/eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: ["Project/frontend/.next"],
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrors": "none" }],
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];