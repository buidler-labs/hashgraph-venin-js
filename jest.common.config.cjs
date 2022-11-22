/* eslint-disable no-undef */

module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ["test/*", "lib.cjs/*", "lib.esm/*"],
  displayName: "hedera-venin",
  moduleFileExtensions: ["js", "ts"],
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  testRunner: "./test/hedera-test-runner.ts",
  testTimeout: 300000,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
