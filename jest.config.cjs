module.exports = {
    preset: "rollup-jest",
    collectCoverage: true,
    displayName: 'hedera-strato',
    moduleFileExtensions: ['js', 'mjs'],
    setupFiles: [
        'dotenv/config'
    ],
    testEnvironment: "./test/jte.mjs",
    testMatch: [
        "**/?(*.)+(spec|test).mjs"
    ],
    testTimeout: 45000,
    transform: {
        "\\.m?js$": ["rollup-jest", {"output": {"sourcemap": true}}]
    },
};
  