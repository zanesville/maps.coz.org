const path = require('path');

module.exports = {
  entry: {
    bundle: ["./source/assets/js/build/main.js"]
  },
  output: {
    filename: 'coz-scripts.min.js',
    path: path.resolve(__dirname, 'source/assets/js/dist'),
    library: 'cozMAP',
    libraryTarget: 'umd',
  },
  mode: "production"
};