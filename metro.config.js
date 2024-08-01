const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      extraNodeModules: {
        '@api': './src/api',
        '@ci': './src/shared',
        '@styles': './src/styles',
        '@assets': './src/assets',
        '@screens': './src/screens',
      }
    }
  };
})();