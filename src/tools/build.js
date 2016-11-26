
'use strict';

/*eslint-disable no-console*/

const webpack = require('webpack');
const htmlBuilder = require('./htmlBuilder');
const chalk = require('chalk');
const path = require('path');

const build = webpackConfig => {
  process.env.NODE_ENV = JSON.stringify('production');
  console.log(chalk.bold(chalk.green(`Generating minified bundle for ${process.env.NODE_ENV} via Webpack. This will take a moment.`)));

  webpack(webpackConfig).run((err, stats) => {
    if (err) {
      console.log(chalk.bold(chalk.green(err)));
      return 1;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.hasErrors) {
      return jsonStats.errors.map(error => console.log(chalk.red(error)));
    }

    if (jsonStats.hasWarnings) {
      console.log(chalk.bold(chalk.yellow('Webpack generated the following warnings: ')));
      return jsonStats.warnings.map(warning => console.log(chalk.yellow(warning)));
    }

    const root = path.dirname(webpackConfig.entry.app[0]);
    const outputPath = path.join(webpackConfig.context, webpackConfig.output.path);
    htmlBuilder.build(root, outputPath, stats.hash);

    console.log(`Webpack stats: ${stats}`);

    console.log(chalk.green('Your app has been compiled in prodction mode and written to /dist. It\'s ready to roll!'));

    return 0;
  });

};

module.exports = build;
