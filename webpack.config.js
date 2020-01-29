const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/js/app.js',
    './src/css/styles.css'
  ],
  output: {
    filename: 'app.js',
    chunkFilename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
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
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
}
