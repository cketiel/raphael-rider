import "./src/i18n";
import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

// Navegación y Hooks de Negocio
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useSignalR } from "./src/hooks/useSignalR";
import { useAuthStore } from "./src/store/useAuthStore"; // Importar AuthStore
import {
  getExpoPushToken,
  savePushTokenToBackend,
} from "./src/services/notificationService";

export default function App() {
  // Inicializa SignalR
  useSignalR();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Referencias para los suscriptores
  const notificationListener =
    useRef<Notifications.EventSubscription>(undefined);
  const responseListener = useRef<Notifications.EventSubscription>(undefined);

  useEffect(() => {
    // 1. Lógica de registro condicional
    const setupNotifications = async () => {
      if (isAuthenticated) {
        const token = await getExpoPushToken();
        if (token) {
          await savePushTokenToBackend(token);
        }
      }
    };

    setupNotifications();

    // Listeners de notificaciones
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Push recibida:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Interacción con push:",
          response.notification.request.content.data,
        );
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]); // Se dispara cada vez que el estado de Auth cambia

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}
