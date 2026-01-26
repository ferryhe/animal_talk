const path = require('path');

module.exports = {
  projectName: 'animal-talk-mp',
  date: '2026-01-25',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  alias: {
    '@': path.resolve(__dirname, '..', '..', 'client', 'src')
  },
  weapp: {},
  h5: {}
};
