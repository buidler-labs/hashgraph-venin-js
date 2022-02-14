/* eslint-disable no-undef */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  root: true,
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "eol-last": ["warn", "always"],
    "indent": [ "warn", 2, { "FunctionExpression": {"body": 1, "parameters": 2}, "ImportDeclaration": 1, "MemberExpression": 1, "SwitchCase": 1 } ],
    "no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 1 }],
    "sort-imports": ["warn", {
      "allowSeparatedGroups": true
    }],
    "sort-keys": ["warn", "asc", { "caseSensitive": true, "minKeys": 2, "natural": false }]
  }
};
