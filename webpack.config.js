const path = require('path');

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },

  output: {
    path: path.resolve(__dirname, './bin'),
    filename: 'app.js',
  },

  devServer: {
    port: 8080
  }
}