var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry:{
        javascript: './main.js',
    },
    output : {
        path: __dirname,
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            },
        ]
    }
};

