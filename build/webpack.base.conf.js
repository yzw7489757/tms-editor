const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const WebpackBar = require('webpackbar');

const {
  resolve,
  htmlPlugins,
  IS_PROD,
} = require('./utils');
const env = require('./env')
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
}); // 启动多线程打包

const { name } = require('../package.json')

const lessStyleLoader = IS_PROD ? MiniCssExtractPlugin.loader : "style-loader"

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    main: ['react-hot-loader/patch', './src/index.tsx']
  },
  output: {
    publicPath: '/',
    path: resolve('dist'),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {loader: 'Happypack/loader?id=HappyBabel'},
          {
            loader: 'awesome-typescript-loader',
          }
      ]
      },
      {
        test: /\.module\.(le|c)ss$/,
        use: 'Happypack/loader?id=ModuleLess'
      },
      {
        test: /.(le|c)ss$/, // 非模块化
        exclude:/\.module\.(le|c)ss$/,
        use: 'Happypack/loader?id=Less'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'images/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'media/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: '[name]-[hash:5].min.[ext]',
          limit: 5000,
          publicPath: 'fonts/',
          outputPath: 'fonts/'
        }
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...htmlPlugins(),
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new HappyPack({
      id: 'ModuleLess',
      use: [
        lessStyleLoader,
        {
          loader: 'typings-for-css-modules-loader',
          options: {
            modules: true,
            namedExport: true,
            camelCase: true,
            localIdentName: "[local]_[hash:base64:5]"
          }
        },
        "postcss-loader",
        "less-loader"
      ]
    }),
    new HappyPack({
      id: 'Less',
      use: [
        lessStyleLoader, 
        "css-loader",
        "postcss-loader",
        "less-loader"
      ]
    }),
    new HappyPack({
      id: 'HappyBabel',
      use: [
        {
          loader:'babel-loader?cacheDirectory=true'
        },
        (IS_PROD?{}:{
          loader: 'react-hot-loader/webpack',
          options: {
            babelrc: true,
            plugins: ['react-hot-loader/babel'],
          }
        }),
      ],
      threadPool: happyThreadPool,
      verbose: true,
    }),
    new WebpackBar({
      profile: true,
      name,
    }),
    new WebpackBuildNotifierPlugin({
      title: name + IS_PROD?' Build':' startup is Running',
      logo: path.resolve("../public/favicon.png"),
      suppressSuccess: "initial"
    }),
    new webpack.WatchIgnorePlugin([
      /css\.d\.ts$/
    ])
  ],
  resolve: {
    extensions: ['.tsx', '.ts','.js'],
    alias: {
      'react-hot-loader': resolve('./node_modules/react-hot-loader'),
      'react-dom': resolve('./node_modules/@hot-loader/react-dom'),
      'react': resolve('./node_modules/react'),
      '@':resolve('./src'),
      'views':resolve('./src/views'),
      'components':resolve('./src/components'),
      'templates':resolve('./src/templates'),
      'store':resolve('./src/store'),
      'utils':resolve('./src/utils'),
    }
  },

};