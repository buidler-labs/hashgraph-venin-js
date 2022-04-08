/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const jestCommonConfig = require('./jest.common.config.cjs');

module.exports = Object.assign({}, jestCommonConfig, {
  setupFilesAfterEnv: [
    "core-js",
    "./test/setup.web.ts",
  ],
  testEnvironment: "./test/jte.web.ts",
  testMatch: [
    "**/?(*.)+(spec|test).ts",
  ],
});
