module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            components: './src/components',
            screens: './src/screens',
            navigation: './src/navigation',
            hooks: './src/hooks',
            api: './src/api',
            store: './src/store',
            utils: './src/utils',
            assets: './src/assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
}; 