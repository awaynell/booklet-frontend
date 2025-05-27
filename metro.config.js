// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

async function createConfig() {
  const nativeWindConfig = withNativeWind(config, {
    input: "./app/global.css",
  });
  nativeWindConfig.resetCache = true;
  return nativeWindConfig;
}

module.exports = createConfig();
