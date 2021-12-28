const fs = require('fs');
let package = require('../package.json');

// Cleanup package and augment with relative deployment info
delete package.devDependencies;

// Add missing files to the build
fs.copyFileSync('./LICENSE.txt', './build/LICENSE.txt');
fs.copyFileSync('./README.md', './build/README.md');
fs.writeFileSync('./build/package.json', JSON.stringify(package, null, 2));
