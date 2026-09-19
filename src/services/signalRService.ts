import * as signalR from "@microsoft/signalr";
import { Alert, Vibration, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationLevel, NotificationDto } from "../domain/types";
import i18n from "../i18n";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  // Get the base URL from app.config.js and strip the /api path for the hubs.
  //
  // ⚠️ Anchored to the END of the string. It used to be .replace("/api", ""), which takes the
  // FIRST match anywhere — and the production host contains "api":
  //
  //   "https://api.raphaeldh.com/api".replace("/api", "")
  //     -> "https:/.raphaeldh.com/api"
  //
  // Measured, not guessed. It happened to work against the old rtempurl host and against the
  // Azure DEV hostname, so nothing would have shown up until the day this app was pointed at
  // api.raphaeldh.com, when the hub would simply never connect.
  private apiUrl =
    Constants.expoConfig?.extra?.apiUrl?.replace(/\/api\/?$/, "") || "";

  /**
   * Initiate the connection with Raphael's Notification Hub.
   */
  async startConnection() {
    // If there is already an active or connecting connection, we do not duplicate
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
        // ⚠️ Read fresh on every call, not captured. SignalR asks again on each automatic
        // reconnect, and the token it captured at connect time may have been renewed since —
        // a connection that dropped would then retry forever with a token the server has
        // already stopped accepting.
        accessTokenFactory: async () =>
          (await SecureStore.getItemAsync("userToken")) ?? "",
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

    // LISTENER: Receive Notifications from the Backend (NotificationDto)
    this.connection.on("ReceiveNotification", async (notification: any) => {
      console.log("New notification received via SignalR");

      // We create a "Transient Recipient" to avoid crashes and enable local tracking
      const transientId = `transient-${notification.Id || notification.id || Math.random()}`;

      const mappedNotif: any = {
        id: notification.Id || notification.id || transientId,
        businessEventCode:
          notification.BusinessEventCode ||
          notification.businessEventCode ||
          "EXTERNAL",
        title: notification.Title || notification.title || "Raphael Update",
        message: notification.Message || notification.message || "",
        severity:
          notification.Severity || notification.severity || "Information",
        status: notification.Status || notification.status || "Delivered",
        createdAtUtc:
          notification.CreatedAtUtc ||
          notification.createdAtUtc ||
          new Date().toISOString(),
        recipients: [
          {
            id: transientId,
            recipientId: "current-rider",
            status: "Delivered",
            recipientType: "Rider",
          },
        ],
      };

      useNotificationStore.getState().addIncomingNotification(mappedNotif);

      // Refresh the store from the database to include the generated GUIDs
      await useNotificationStore.getState().fetchNotifications();

      // Trigger the native Alert for critical messages as we did before
      if (
        this.mapSeverityToLevel(notification.Severity) ===
        NotificationLevel.Alert
      ) {
        Vibration.vibrate([0, 500]);
        Alert.alert(notification.Title, notification.Message);
      }
    });

    // Connection event handling
    this.connection.onreconnecting((error) => {
      console.warn("SignalR: Connection lost. Retrying...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(
        "SignalR: Connection successfully recovered. ID:",
        connectionId,
      );
    });

    try {
      await this.connection.start();
      console.log("SignalR: Connected to the Raphael Ecosystem");
    } catch (err) {
      console.error("SignalR: Error starting:", err);
      // Manual retry after 5 seconds if startup fails
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  /**
   * Stops the current connection
   */
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        console.log("SignalR: Manually disconnected");
      } catch (err) {
        console.error("SignalR: Error stopping the connection:", err);
      }
    }
  }

  /**
   * Maps backend severity to Rider app levels.
   */
  private mapSeverityToLevel(severity: any): NotificationLevel {
    const s = severity?.toString().toUpperCase();
    // Matches Backend NotificationSeverity: Error(4) and Critical(5)
    if (s === "CRITICAL" || s === "ERROR" || s === "5" || s === "4") {
      return NotificationLevel.Alert;
    }
    // Matches Warning(3)
    if (s === "WARNING" || s === "3") {
      return NotificationLevel.Warning;
    }
    return NotificationLevel.Info;
  }
}

export const signalRService = new SignalRService();
