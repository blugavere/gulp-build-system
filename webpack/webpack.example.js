//var path = require('path');
//NOTE: MOVE THIS TO ROOT
module.exports = {
  entry: {
    app: ['./src/client/index']
  },
  output: {
    //path: path.resolve(__dirname, 'build'),
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './build'
  },
};