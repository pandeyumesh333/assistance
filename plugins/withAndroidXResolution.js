const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidXResolution(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Add resolution strategy to force AndroidX versions and prevent duplicates
      const resolutionStrategy = `
    configurations.all {
        resolutionStrategy {
            // Only force the specific library that caused the duplicate class error
            // but use a version that is compatible with modern AndroidX
            force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
        }
        // Exclude the old support library group to prevent conflicts
        exclude group: 'com.android.support', module: 'versionedparcelable'
    }
`;
      if (!config.modResults.contents.includes('resolutionStrategy')) {
        config.modResults.contents = config.modResults.contents.replace(
          /allprojects\s*{/g,
          `allprojects {${resolutionStrategy}`
        );
      }
    }
    return config;
  });
};
