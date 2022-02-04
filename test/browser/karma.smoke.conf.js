process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '.',
    browsers: ['ChromeHeadless'],
    files: [
      { pattern: './lib.esm/*.js', type: 'module' },
      { pattern: './smoke.spec.js', type: 'module' },
    ],
    frameworks: ['jasmine'],
    logLevel: config.LOG_DEBUG,
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
    ],
    reporters: ['progress'],
    singleRun: true
  });
};