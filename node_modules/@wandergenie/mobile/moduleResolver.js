/**
 * Metro module resolver for React Native
 * This helps Metro bundler resolve TypeScript modules without extensions
 */
const path = require('path');

module.exports = {
  // Resolve module imports in the src directory
  resolver: {
    extraNodeModules: {
      components: path.resolve(__dirname, 'src/components'),
      screens: path.resolve(__dirname, 'src/screens'),
      navigation: path.resolve(__dirname, 'src/navigation'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      api: path.resolve(__dirname, 'src/api'),
      store: path.resolve(__dirname, 'src/store'),
      utils: path.resolve(__dirname, 'src/utils'),
      assets: path.resolve(__dirname, 'src/assets'),
    },
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  }
}; 