'use strict';
/*eslint-disable no-console*/
require('colors');
const webpack = require('webpack');
const htmlBuilder = require('./htmlBuilder');

const build = webpackConfig => {
  
  process.env.NODE_ENV = 'production';
  console.log('Generating minified bundle for production via Webpack. This will take a moment.'.bold.green);

  webpack(webpackConfig).run((err, stats) => {
    if (err) {
      console.log(err.bold.red);
      return 1;
    }

    const jsonStats = stats.toJson();
    console.log(stats);
    if (jsonStats.hasErrors) {
      return jsonStats.errors.map(error => console.log(error.red));
    }

    if (jsonStats.hasWarnings) {
      console.log('Webpack generated the following warnings: '.bold.yellow);
      return jsonStats.warnings.map(warning => console.log(warning.yellow));
    }
    console.log('building html with hash: ', stats.hash);
    htmlBuilder.build(stats.hash);
    console.log(`Webpack stats: ${stats}`);

    console.log('Your app has been compiled in prodction mode and written to /dist. It\'s ready to roll!'.green);

    return 0;
  });

};

module.exports = build;
