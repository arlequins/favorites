const webpack = require('webpack')
const path = require('path')
const CleanWebPackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const helpers = require('./helpers')
const env = helpers.currentEnvironment(process.env)

const buildFolder = path.join(__dirname, 'dist')

module.exports = {
  entry: {
    'tsukuyomi': [ path.join(__dirname, 'src', 'index') ],
  },
  output: {
    path: buildFolder,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    mainFields: ['module', 'browser', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx)$/,
        include: [ /src\/js/, /node_modules\/axios/ ],
        exclude: /node_modules/,
        use: [
          'ts-loader'
        ].filter(Boolean),
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          configFile: 'tslint.json',
          tsConfigFile: 'tsconfig.json',
        },
      },
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG: false,
      API_URL: env.API_URL ? env.API_URL : 'http://localhost:3000',
      API_V1: env.API_V1 ? env.API_V1 : 'v1',
      ENV: env.ENV ? env.ENV : 'production',
      DEBUG: env.DEBUG ? env.DEBUG : false,
    }),
    new CleanWebPackPlugin(
      buildFolder,
      {
        allowExternal: true,
        exclude:  [],
        verbose:  true,
        dry:      false,
      },
    ),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 5,
          warnings: false,
          parse: {},
          compress: {
            sequences: true,
            dead_code: true,
            unused: true,
            join_vars: true,
            drop_console: env.DEBUG ? false : true,
            drop_debugger: true,
            inline: false,
            passes: 2
          },
          mangle: {
            reserved: ['tsukuyomi']
          },
          output: {
            indent_level: 0,
            quote_style: 1,
            wrap_iife: true,
          },
          toplevel: false,
          nameCache: null,
          ie8: true,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: true,
        },
        cache: true,
        parallel: true,
        sourceMap: false,
      })
    ],
  },
  devServer: {
    contentBase: [
      path.join(__dirname, 'src', 'assets'),
    ],
    watchContentBase: true,
    hot: true,
    inline: true,
    historyApiFallback: {
      index: `/`
    },
    stats: 'minimal',
    openPage: ``,
    publicPath: `/`,
    port: '5000',
  },
}
