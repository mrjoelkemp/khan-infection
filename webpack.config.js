var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'khan-infection.js',
        library: 'KhanInfection',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            { test: __dirname,
              loader: 'babel-loader' }
        ]
    }
};