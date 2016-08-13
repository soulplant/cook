module.exports = {
  entry: {
    parseTest: './parseTest.ts',
    scriptTest: './scriptTest.ts',
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}
