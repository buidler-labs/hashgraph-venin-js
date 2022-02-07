process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '.',
    browsers: ['ChromeHeadless'],
    files: [
      { pattern: './lib.esm/*.js', type: 'module' },
      { pattern: './lib.esm/*.js.map', included: false, served: true, watched: false, nocache: true },
      { pattern: './smoke.spec.js', type: 'module' },
    ],
    frameworks: ['jasmine'],
    logLevel: config.LOG_DEBUG,
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
    reporters: ['progress'],
    singleRun: true
  });
};