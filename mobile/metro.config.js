/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */

const { getDefaultConfig } = require('expo/metro-config');
const { resolver } = require('./moduleResolver');

const config = getDefaultConfig(__dirname);

// Apply our custom resolver settings
Object.assign(config.resolver, resolver);

module.exports = config; 