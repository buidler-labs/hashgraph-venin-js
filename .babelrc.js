module.exports = {
  env: {
    esm: {
      ignore: ["test/**/*.spec.ts"],
      presets: ["@babel/preset-typescript"],
      plugins: [
        [
          "@babel/plugin-transform-runtime",
          {
            absoluteRuntime: false,
            corejs: false,
            helpers: true,
            regenerator: true,
          },
        ],
        ["babel-plugin-add-import-extension", { extension: "mjs" }],
      ],
    },
    cjs: {
      ignore: ["test/**/*.spec.ts"],
      presets: [
        ["@babel/env", { modules: "commonjs" }],
        "@babel/preset-typescript",
      ],
      plugins: [
        [
          "@babel/plugin-transform-runtime",
          {
            absoluteRuntime: false,
            corejs: false,
            helpers: true,
            regenerator: true,
          },
        ],
      ],
    },
  },
};
