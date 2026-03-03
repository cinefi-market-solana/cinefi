// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const cfg = getDefaultConfig(__dirname);

cfg.resolver.extraNodeModules = {
  crypto: require.resolve("expo-crypto"),
  stream: require.resolve("readable-stream"),
  path: require.resolve("path-browserify"),
  url: require.resolve("url"),
};

module.exports = cfg;
