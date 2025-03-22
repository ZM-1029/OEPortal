// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      require.resolve("eslint-config-prettier"),
      require.resolve("eslint-plugin-prettier/recommended"),
    ],
    processor: angular.processInlineTemplates,
    rules: {
     "prettier/prettier": "error",
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "prefer-const": "error",
    "no-var": "error",
    "arrow-parens": ["error", "always"],
    "eqeqeq": ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
