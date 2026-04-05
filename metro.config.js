const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// .sql files are handled by babel-plugin-inline-import, which replaces
// the import with the file content as a string during Babel transformation.
// They should NOT be in sourceExts (Metro parses as JS) or assetExts
// (Metro returns an asset ID instead of content).

module.exports = withNativeWind(config, { input: "./global.css" });
