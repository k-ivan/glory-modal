const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('./package.json');
const paths = {
  srccss: './src/scss',
  srcjs: './src/js',
  dist: './dist'
};
const banner = `Glory-modal plugin v${pkg.version} | MIT License | https://github.com/k-ivan/glory-modal`;

module.exports = (env, arg) => {
  return {
    entry: [
      `${paths.srccss}/gmodal.scss`,
      `${paths.srcjs}/gmodal.js`
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'gmodal.js',
      library: 'Gmodal',
      libraryTarget: 'umd',
      libraryExport: 'default',
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`
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
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')
                  ]
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  outputStyle: 'expanded'
                }
              }
            }
          ]
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, paths.srcjs),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    devServer: {
      port: 8088,
      static: path.join(__dirname, paths.dist),
      compress: true,
      client: {
        progress: true
      }
    },
    devtool: arg.mode === 'development' ? 'eval-source-map' : false,
    plugins: [
      new CleanWebpackPlugin({
        verbose: true,
        cleanOnceBeforeBuildPatterns: [
          '**/*',
          '!index.html'
        ]
      }),
      new MiniCssExtractPlugin({
        filename: 'gmodal.css'
      }),
      new webpack.BannerPlugin({
        test: /\.js$/,
        banner: banner
      })
    ]
  };
};
