const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  entry: [
    './src/js/app.js',
    './src/css/styles.css'
  ],
  output: {
    filename: 'app.js',
    chunkFilename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
                require('@fullhuman/postcss-purgecss')({
									content: [
										'./src/**/**/*.vue',
										'./src/*.js',
										'./public/index.html',
                    './src/css/*.css',
                    './node_modules/flatpickr/dist/flatpickr.css'
									],
									defaultExtractor: content => content.match(/[A-za-z0-9-_:/]+/g) || []
								})
              ],
            },
          }
        ]
      },
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: 'babel-loader'
      },
      {
        test: /.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new MomentLocalesPlugin(),
    new VueLoaderPlugin(),
  ]
}
