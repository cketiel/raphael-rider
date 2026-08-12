import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import apiClient from "../api/apiClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,

    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * SOLO obtiene el token del hardware/Expo
 */
export const getExpoPushToken = async () => {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "3808f47e-8361-4b79-bf30-e51c1f26ea08",
      })
    ).data;
    console.log("Expo Push Token:", token);
    return token;
  } catch (error) {
    console.error("Error al obtener Expo Token:", error);
    return null;
  }
};

/**
 * Envía el token al Backend (Requiere Auth)
 */
export const savePushTokenToBackend = async (token: string) => {
  try {
    await apiClient.post("/Rider/profile/push-token", { token });
    console.log("Push Token sincronizado con el Backend de Raphael");
    return true;
  } catch (error) {
    console.error("Error al guardar token en backend (401 probable):", error);
    return false;
  }
};
