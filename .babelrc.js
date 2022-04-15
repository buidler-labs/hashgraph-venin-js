const sharedPresets = ["@babel/preset-typescript"];
const shared = {
  ignore: ["test/**/*.spec.ts"],
  presets: sharedPresets,
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
};

module.exports = {
  env: {
    esm: shared,
    cjs: {
      ...shared,
      presets: [["@babel/env", { modules: "commonjs" }], ...sharedPresets],
    },
    test: {
      presets: [["@babel/env"], ...sharedPresets],
    },
  },
};
