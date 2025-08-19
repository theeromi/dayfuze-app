export default ({ config }) => {
  return {
    ...config,
    name: "DayFuse",
    slug: "dayfuse",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#5B7FFF"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dayfuse.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#5B7FFF"
      },
      package: "com.dayfuse.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-dev-client"
    ],
    extra: {
      // TODO: Replace with your actual Firebase configuration
      firebaseApiKey: process.env.FIREBASE_API_KEY || "your-firebase-api-key",
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
      firebaseAppId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
    }
  };
};