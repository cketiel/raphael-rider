import * as signalR from "@microsoft/signalr";
import { Alert, Vibration, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationLevel } from "../domain/types";
import i18n from "../i18n";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  // Obtenemos la URL base desde app.config.js y limpiamos el path /api para los hubs
  private apiUrl =
    Constants.expoConfig?.extra?.apiUrl?.replace("/api", "") || "";

  /**
   * Inicia la conexión con el Hub de Notificaciones de Raphael
   */
  async startConnection() {
    // Si ya existe una conexión activa o conectando, no duplicamos
    if (
      this.connection &&
      (this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting)
    ) {
      return;
    }

    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      console.log("SignalR: No se encontró token, abortando conexión.");
      return;
    }

    const hubUrl = `${this.apiUrl}/hubs/notifications`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => token,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds < 60000) return 2000;
          return 10000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // ESCUCHADOR: Recibir Notificaciones desde el Backend (NotificationDto)
    this.connection.on("ReceiveNotification", (notification: any) => {
      console.log("SignalR: Notificación entrante:", notification);

      // 1. Normalización de datos (Soporta PascalCase del Backend y camelCase)
      const id = notification.id || notification.Id || Math.random().toString();
      const title =
        notification.title || notification.Title || i18n.t("notifs.title");
      const message = notification.message || notification.Message || "";
      const severity = notification.severity || notification.Severity;
      const tripId = notification.tripId || notification.TripId;

      const level = this.mapSeverityToLevel(severity);

      // 2. Guardar en el Store local de la App
      useNotificationStore.getState().addNotification({
        id,
        title,
        message,
        date:
          notification.createdAtUtc ||
          notification.CreatedAtUtc ||
          new Date().toISOString(),
        level,
        read: false,
        tripId,
      });

      // 3. INTERCEPTOR DE ALERTAS: Si el nivel es crítico, mostrar Popup nativo
      if (level === NotificationLevel.Alert) {
        // Patrón de vibración: Espera 0ms, Vibra 500ms, Espera 200ms, Vibra 500ms
        Vibration.vibrate([0, 500, 200, 500]);

        Alert.alert(
          title,
          message,
          [
            {
              text: i18n.t("common.cancel"),
              style: "cancel",
            },
            {
              text: i18n.t("notifs.view_trip") || "Ver Viaje",
              onPress: () => {
                // Aquí podrías implementar la navegación al mapa si tripId existe
                console.log("Acción: Navegar al viaje", tripId);
              },
            },
          ],
          { cancelable: true },
        );
      }
    });

    // Manejo de eventos de conexión
    this.connection.onreconnecting((error) => {
      console.warn("SignalR: Perdimos conexión. Reintentando...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(
        "SignalR: Conexión recuperada exitosamente. ID:",
        connectionId,
      );
    });

    try {
      await this.connection.start();
      console.log("SignalR: Conectado al Ecosistema Raphael");
    } catch (err) {
      console.error("SignalR: Error al iniciar:", err);
      // Reintento manual tras 5 segundos si falla el inicio
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  /**
   * Detiene la conexión actual
   */
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        console.log("SignalR: Desconectado manualmente");
      } catch (err) {
        console.error("SignalR: Error al detener la conexión:", err);
      }
    }
  }

  /**
   * Mapea la severidad del backend a los niveles de la app Rider
   */
  private mapSeverityToLevel(severity: any): NotificationLevel {
    const s = severity?.toString().toUpperCase();
    // Coincide con NotificationSeverity del Backend: Error(4) y Critical(5)
    if (s === "CRITICAL" || s === "ERROR" || s === "5" || s === "4") {
      return NotificationLevel.Alert;
    }
    // Coincide con Warning(3)
    if (s === "WARNING" || s === "3") {
      return NotificationLevel.Warning;
    }
    return NotificationLevel.Info;
  }
}

export const signalRService = new SignalRService();
