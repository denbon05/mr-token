import eslintConfigPrettier from "eslint-config-prettier";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  },
  { languageOptions: { globals: { ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["node_modules", "dist"],
  },
];
