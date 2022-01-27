module.exports = {
    preset: "ts-jest",
    collectCoverage: true,
    displayName: 'hedera-strato',
    moduleFileExtensions: ['js', 'ts'],
    setupFiles: [
        'dotenv/config'
    ],
    testMatch: [
        "**/?(*.)+(spec|test).ts"
    ],
    testTimeout: 180000,
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
};
  