module.exports = {
    preset: "ts-jest",
    collectCoverage: true,
    displayName: 'hedera-strato',
    moduleFileExtensions: ['js', 'mjs', 'ts'],
    setupFiles: [
        'dotenv/config'
    ],
    testEnvironment: "./test/jte.ts",
    testMatch: [
        "**/?(*.)+(spec|test).ts"
    ],
    testTimeout: 45000,
    transform: {
        "\\.m?js$": ["rollup-jest", {"output": {"sourcemap": true}}],
        "^.+\\.ts?$": "ts-jest"
    },
};
  