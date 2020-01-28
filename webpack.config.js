const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: [
    './src/js/app.js',
    './src/css/styles.css'
  ],
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public/js')
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
          // {
          //   loader: 'postcss-loader',
          //   options: {
          //     ident: 'postcss',
          //     plugins: [
          //       require('tailwindcss'),
          //       require('autoprefixer'),
          //     ],
          //   },
          // }
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
