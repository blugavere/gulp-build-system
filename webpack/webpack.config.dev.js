const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const modules = require('./modules');

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('development')
};

//var root_folder = path.resolve(__dirname, '..')
module.exports = config => {

  return {
    context: __dirname,
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    noInfo: false,
    target: 'web',
    inline: true,
    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.css', '.less', 'scss', '.jsx']
    },
    entry: {
      app: ['./src/client/index']
    },
    output: {
      path: require('path').resolve('./'),
      publicPath: 'http://localhost:8080/',
      filename: 'bundle.js',
    },
    module: modules,
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin(GLOBALS),
      new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin('styles.css')
    ]
  };
};