import { create } from "zustand";
import apiClient from "../api/apiClient";
import { NotificationDto } from "../domain/types";

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsViewed: (id: string) => Promise<void>;
  acknowledgeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<NotificationDto[]>(
        "/Rider/notifications",
      );
      const data = response.data;

      // Calculate unread: Check if ViewedAtUtc is null in the first recipient record
      const unread = data.filter((n) => !n.recipients[0]?.viewedAtUtc).length;

      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (error) {
      console.error("[NotificationStore] Fetch Error:", error);
      set({ isLoading: false });
    }
  },

  markAsViewed: async (recipientRecordId: string) => {
    try {
      await apiClient.post(`/Rider/notifications/${recipientRecordId}/view`);
      await get().fetchNotifications(); // Refresh state from server
    } catch (error) {
      console.error("[NotificationStore] View Error:", error);
    }
  },

  acknowledgeNotification: async (recipientRecordId: string) => {
    try {
      await apiClient.post(
        `/Rider/notifications/${recipientRecordId}/acknowledge`,
      );
      await get().fetchNotifications(); // This will effectively remove it from the active list
    } catch (error) {
      console.error("[NotificationStore] Acknowledge Error:", error);
    }
  },
  /**
   * Bulk acknowledge all notifications.
   * Business logic: Iterates through all current notifications and marks them as acknowledged.
   */
  clearAllNotifications: async () => {
    const { notifications, fetchNotifications } = get();
    if (notifications.length === 0) return;

    try {
      set({ isLoading: true });
      // In a real production environment, a bulk endpoint /Rider/notifications/clear-all is preferred.
      // For now, we process them based on the available API.
      const promises = notifications.map((n) =>
        apiClient.post(
          `/Rider/notifications/${n.recipients[0].id}/acknowledge`,
        ),
      );
      await Promise.all(promises);
      await fetchNotifications();
    } catch (error) {
      console.error("[NotificationStore] ClearAll Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
