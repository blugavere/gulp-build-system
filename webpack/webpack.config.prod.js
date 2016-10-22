const webpack = require('webpack');
//const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
const modules = require('./modules');

const GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('production')
};

module.exports = (config) => {

    return {
        debug: true,
        devtool: 'source-map',
        noInfo: false,
        entry: './lib/client/index.js',
        target: 'web',
        output: {
            path: 'dist/client',
            publicPath: 'dist/client',
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
            new webpack.optimize.UglifyJsPlugin()
        ]
    };
};