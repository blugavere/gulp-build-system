const fs = require('fs');

const babelConfig = JSON.parse(fs.readFileSync('./.babelrc'));

console.log(JSON.parse(babelConfig));