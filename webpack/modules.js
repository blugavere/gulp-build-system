const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fs = require('fs');
const babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc')));
babelConfig.presets = babelConfig.presets.map(x => `babel-preset-${x}`).map(require.resolve);
babelConfig.plugins = babelConfig.plugins.map(x => `babel-plugin-${x}`).map(require.resolve);

module.exports = {
  loaders: [{
    test: /\.js$/,
    include: [
      path.join(__dirname, '../lib'),
      path.join(__dirname, '../src')
    ],
    loaders: ['babel'],
    query: babelConfig
  }, {
    test: /\.jsx$/,
    include: [
      path.join(__dirname, '../lib'),
      path.join(__dirname, '../src')
    ],
    loaders: ['babel'],
    query: babelConfig
  }, {
    test: /\.json$/,
    loaders: ['json']
  }, {
    test: /\.ts$/,
    loader: 'ts-loader'
  }, {
    test: /(\.css)$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css?sourceMap')
      //loaders: ['style', 'css']
  }, {
    test: /\.less$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
  }, {
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
  }, {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=10000&minetype=application/font-woff'
  }, {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'file-loader'
  }]
};