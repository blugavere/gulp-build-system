const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('production')
};

module.exports = (config, babelConfig) => {
    const modules = require('./modules')(config, babelConfig);
    return {
        debug: true,
        devtool: 'source-map',
        noInfo: false,
        entry: {
            app: [
                //'./lib/client/index.js',
            ]
        },
        target: 'web',
        output: {
            path: 'dist/client',
            //publicPath: 'dist/client',
            publicPath: '/',
            
            filename: 'bundle.[hash].js'
        },
        devServer: {
            contentBase: './dist/client'
        },
        module: modules,
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.DefinePlugin(GLOBALS),
            new ExtractTextPlugin('styles.[hash].css'),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.AggressiveMergingPlugin()
        ]
    };
};