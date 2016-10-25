
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const modules = (config, babelConfig) => {
  return {
    loaders: [{
      test: /\.(js|jsx)$/,
      include: [
        config.clientWatch
      ],
      loader: 'babel',
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
};

module.exports = modules;