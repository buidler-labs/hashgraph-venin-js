const fs = require('fs');

// Add missing files to the docs
fs.copyFileSync('./.env.sample', './docs/.env.sample');
fs.writeFileSync('./docs/CNAME', 'hsj-docs.buidlerlabs.com');
fs.writeFileSync('./docs/.env.local-customnet', `HEDERAS_NETWORK=customnet
HEDERAS_NODES=127.0.0.1:50211#3,127.0.0.1:50212#4,127.0.0.1:50213#5
HEDERAS_OPERATOR_ID=0.0.2
HEDERAS_OPERATOR_KEY=91132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137`);