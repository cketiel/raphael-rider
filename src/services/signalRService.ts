import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationLevel } from "../domain/types";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private apiUrl = Constants.expoConfig?.extra?.apiUrl.replace("/api", ""); // Quitamos /api para llegar a /hubs

  async startConnection() {
    if (this.connection) return;

    const token = await SecureStore.getItemAsync("userToken");
    if (!token) return;

    // Configuramos la conexión hacia el Hub de Raphael
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/hubs/notifications?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // ESCUCHADOR: Recibir Notificaciones (Debe coincidir con INotificationClient del Backend)
    this.connection.on("ReceiveNotification", (notification: any) => {
      console.log("Nueva notificación recibida via SignalR:", notification);

      // Agregamos la notificación al store global de la App
      useNotificationStore.getState().addNotification({
        id: Math.random().toString(),
        title: notification.title,
        message: notification.message,
        date: new Date().toISOString(),
        level: notification.level || NotificationLevel.Info,
        read: false,
        tripId: notification.tripId,
      });
    });

    try {
      await this.connection.start();
      console.log("SignalR: Conectado al ecosistema Raphael");
    } catch (err) {
      console.error("SignalR Error al conectar:", err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log("SignalR: Desconectado");
    }
  }
}

export const signalRService = new SignalRService();
