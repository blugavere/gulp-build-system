const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const modules = require('./webpack/modules');

const GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('production')
};

module.exports = function (config) {

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
            new ExtractTextPlugin('styles.css'),
            new webpack.optimize.DedupePlugin(), //dedupes bundles
            new webpack.optimize.UglifyJsPlugin(),
            new HtmlWebpackPlugin({
                title: 'Ben Lugavere',
                hash: true,
                //template: './src/client/index.template.ejs',
                inject: 'body'
            }),
        ]
    };
};