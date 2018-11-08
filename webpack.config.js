const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'public/js/bundle'),
    filename: '[name].js',
    chunkFilename: 'js/bundle/[name]_v.js',
  },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        }, 
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
      ]
    }
  };