const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            filename: 'bundle.js'
        },
        devServer: {
            contentBase: './dist/client'
        },
        module: {
            loaders: [
                { test: /\.js$/, include: path.join(__dirname, 'lib'), loaders: ['babel'] },
                { test: /(\.css)$/, loader: ExtractTextPlugin.extract('css?sourceMap') },
                {
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
                },
                { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
                { test: /\.(woff|woff2)$/, loader: 'url?prefix=font/&limit=5000' },
                { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
                { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
            ]
        },
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