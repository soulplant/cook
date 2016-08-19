module.exports = {
  entry: {
    parserTest: './parserTest.ts',
    scriptTest: './scriptTest.ts',
    appTest: './appTest.ts',
    listmakerTest: './listmakerTest.ts'
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
