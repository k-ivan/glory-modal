const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const pkg = require('./package.json');
const paths = {
  srccss: './src/scss',
  srcjs: './src/js',
  dist: './dist'
}
const banner = `Modal-plugin v${pkg.version} | MIT License | https://github.com/k-ivan/modal-plugin`;

module.exports = (env, arg) => {
  return {
    entry: [
      `${paths.srccss}/modal.scss`,
      `${paths.srcjs}/modal.js`
    ],
    output: {
      filename: 'modal.js',
      library: 'Modal',
      libraryTarget: 'umd',
      libraryExport: 'default',
      umdNamedDefine: true
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded'
              }
            }

          ],
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, paths.srcjs),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env'],
              plugins: ['@babel/plugin-transform-object-assign']
            }
          }
        }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, paths.dist),
      compress: true,
      overlay: true,
      port: 8080
    },
    devtool: arg.mode === 'development' ? 'eval-source-map' : false,
    plugins: [
      new CleanWebpackPlugin([paths.dist], {
        exclude: ['index.html'],
        verbose: true
      }),
      new MiniCssExtractPlugin({
        filename: 'modal.css'
      }),
      new webpack.BannerPlugin({
        test: /\.js$/,
        banner: banner
      })
    ]
  };
};
