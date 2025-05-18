const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load .env file
const env = dotenv.config().parsed || {};

// Log env loading for debugging
console.log('Dotenv loaded:', !!dotenv.config().parsed);
console.log('Environment variables found:', Object.keys(env).length);

// Convert environment variables to strings
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

// Always ensure we have a REACT_APP_GEMINI_API_KEY for development
if (!envKeys['process.env.REACT_APP_GEMINI_API_KEY']) {
  console.warn('Warning: REACT_APP_GEMINI_API_KEY not found in .env file.');
  // Add a placeholder for development (will log missing in console)
  envKeys['process.env.REACT_APP_GEMINI_API_KEY'] = JSON.stringify('');
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    assetModuleFilename: 'images/[hash][ext][query]'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin(envKeys),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: process.env.PORT || 3000,
    hot: true,
    historyApiFallback: true,
  },
}; 