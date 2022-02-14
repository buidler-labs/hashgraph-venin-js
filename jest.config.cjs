/* eslint-disable no-undef */

module.exports = {
  collectCoverage: true,
  displayName: 'hedera-strato',
  moduleFileExtensions: ['js', 'ts'],
  preset: "ts-jest",
  setupFiles: [
    'dotenv/config'
  ],
  testMatch: [
    "**/?(*.)+(spec|test).ts"
  ],
  testTimeout: 300000,
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
};
