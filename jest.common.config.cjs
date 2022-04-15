/* eslint-disable no-undef */

module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ["test/*"],
  displayName: "hedera-strato",
  moduleFileExtensions: ["js", "ts"],
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  testRunner: "./test/hedera-test-runner.ts",
  testTimeout: 300000,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
