/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '.',
    browsers: ['ChromeHeadless'],
    files: [
      { pattern: './lib.esm/*.js', type: 'module' },
      { included: false, nocache: true, pattern: './lib.esm/*.js.map', served: true, watched: false },
      { pattern: './smoke.spec.js', type: 'module' },
    ],
    frameworks: ['jasmine'],
    logLevel: config.LOG_DEBUG,
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
    ],
    reporters: ['progress'],
    singleRun: true,
  });
};
