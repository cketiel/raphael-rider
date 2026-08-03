import { create } from "zustand";
import { RaphaelNotification, NotificationLevel } from "../domain/types";

interface NotificationState {
  notifications: RaphaelNotification[];
  unreadCount: number;
  addNotification: (notification: RaphaelNotification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    // Datos de prueba iniciales
    {
      id: "1",
      title: "Viaje Próximo",
      message: "Recuerde su viaje de hoy a las 2:00 PM.",
      date: new Date().toISOString(),
      level: NotificationLevel.Info,
      read: false,
    },
    {
      id: "2",
      title: "¡El transporte ha llegado!",
      message: "Su conductor está en la puerta. Por favor, salga al encuentro.",
      date: new Date().toISOString(),
      level: NotificationLevel.Alert,
      read: false,
      tripId: 101,
    },
  ],
  unreadCount: 2,
  addNotification: (n) => {
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Si es una alerta crítica, mostramos un aviso emergente inmediato
    if (n.level === "Alert") {
      // Aquí se puede usar una librería de Toast o Alert.alert
    }
  },
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
