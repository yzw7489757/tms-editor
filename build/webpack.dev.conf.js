const merge = require('webpack-merge')
const webpack = require('webpack')
const open = require('opn');
const portFinder = require('portfinder'); // 端口查找
const baseConfig = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'); // 友好提示
const DashboardPlugin = require("webpack-dashboard/plugin"); // 仪表盘
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path')
const {resolve,getIp} =require('./utils')

const devConfig = merge(baseConfig, {
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: 'localhost',
    quiet: true, // 关闭webpack自带提示
    overlay: {
      warnings: false,
      errors: true
    }, // 出现编译error时，全屏覆盖显示
    clientLogLevel: 'warning',
    after() {
      open(`http://localhost:${this.port}`);
    },
  },
  resolve:{
    alias:{
      '@Types':resolve('./types'),
      assets:resolve('./src/assets')
    }
  },
  plugins: [
    new DashboardPlugin(),
    // new TsconfigPathsPlugin({
    //   configFile:resolve('./tsconfig.json')
    // }),
  ]
})

module.exports = new Promise((r, j) => {
  // 自动检测serve端口是否被占用,自增查找
  portFinder.basePort = 3000;
  portFinder.getPort((err, port) => {
    if (err) {
      j(err);
    } else {
      devConfig.devServer.port = port;
      devConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [`\n\nApp running At: \n - Local :http://${devConfig.devServer.host}:${port} \n - LAN   :http://${getIp()}:${port}`],
            notes: ['Happy Development ^_^']

          },
          onErrors: undefined,
          clearConsole: true
        }),
      );
      r(devConfig);
    }
  });
});