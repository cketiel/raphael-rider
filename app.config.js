import "dotenv/config";

export default {
  expo: {
    name: "Raphael Rider",
    slug: "raphael-rider",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },   
    plugins: [
      "expo-secure-store",     
      "@react-native-community/datetimepicker"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.raphael.rider",
    },
    android: {
      package: "com.raphael.rider",
      config: {
        googleMaps: {        
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      eas: {
        projectId: "3808f47e-8361-4b79-bf30-e51c1f26ea08",
      },
      // Esta URL será accesible vía Constants.expoConfig.extra.apiUrl
      apiUrl: process.env.API_URL,
    },
  },
};