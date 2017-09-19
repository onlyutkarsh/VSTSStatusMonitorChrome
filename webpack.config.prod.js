const webpack = require("webpack");
const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        popup: path.join(__dirname, 'src/popup.ts'),
        options: path.join(__dirname, 'src/options.ts'),
        background: path.join(__dirname, 'src/background.ts'),
        vendor: ['moment', 'jquery']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: "pre",
                loader: "tslint-loader",
                options: {
                    emitErrors: true,
                    failOnHint: true
                }
            },
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.s?css$/,
                loaders: ["style", "css", "sass"]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        // copy required files from src to dist
        new CopyWebpackPlugin([
            { from: "./src/*.html", flatten: true },
            { from: "./src/manifest.json"},
            { from: "./src/icons", to: "icons" },
            { from: "./src/css", to: "css" }
        ]),

        // pack common vender files
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),

        // exclude locale files in moment
        new webpack.IgnorePlugin(/^\.\/locale$/),

        // minify
        // new webpack.optimize.UglifyJsPlugin()
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                warnings: true,
                drop_console: true
            }
        }),
    ]
};
