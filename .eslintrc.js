/* eslint-disable no-undef */

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "comma-dangle": ["warn", "always-multiline"],
    "eol-last": ["warn", "always"],
    "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 1 }],
    "sort-imports": ["warn", { allowSeparatedGroups: true }],
    "sort-keys": [
      "warn",
      "asc",
      { caseSensitive: true, minKeys: 2, natural: false },
    ],
  },
};
