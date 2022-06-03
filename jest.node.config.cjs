/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const jestCommonConfig = require("./jest.common.config.cjs");

module.exports = Object.assign({}, jestCommonConfig, {
  coveragePathIgnorePatterns: [
    ...jestCommonConfig.coveragePathIgnorePatterns,
    "BrowserWallet",
  ],
  testEnvironment: "./test/jte.node.ts",
  testMatch: ["**/?(*.)+(spec|test).ts"],
  testPathIgnorePatterns: ["web.(spec|test).ts"],
});
