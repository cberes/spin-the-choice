var path = require('path');
var webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: [
    'babel-polyfill',
    './src/js/main',
    './src/css/main.css'
  ],
  output: {
      path: path.join(__dirname, 'docs'),
      publicPath: '/',
      filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader',
        options: {
          presets: ["es2015"],  
        }
      },
      {
        test: /\.css$/,
        include: path.join(__dirname, 'src'),
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.ogg$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ]
  },
  devServer: {
    contentBase: "./src"
  }
};
