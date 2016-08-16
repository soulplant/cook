module.exports = {
  entry: {
    parseTest: './parseTest.ts',
    scriptTest: './scriptTest.ts',
    appTest: './appTest.ts'
  },
  output: {
    filename: '[name].bundle.js'
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
