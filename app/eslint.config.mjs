import eslintConfigPrettier from "eslint-config-prettier";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config([
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
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "warn",
    }
  },
]);
