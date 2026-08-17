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
  addIncomingNotification: (newNotif: any) => void;
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
      const serverData = response.data;

      set((state) => {
        const currentTransients = state.notifications.filter((n) =>
          n.recipients[0]?.id.startsWith("transient-"),
        );

        const combined = [...currentTransients, ...serverData];

        const unread = combined.filter(
          (n) => !n.recipients[0]?.viewedAtUtc,
        ).length;

        return {
          notifications: combined,
          unreadCount: unread,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("[NotificationStore] Fetch Error:", error);
      set({ isLoading: false });
    }
  },

  /*fetchNotifications: async () => {
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
  },*/

  markAsViewed: async (recipientRecordId: string) => {
    // INTERCEPTOR: If it's a test/transient notification, only update local state
    if (recipientRecordId.startsWith("transient-")) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.recipients[0].id === recipientRecordId
            ? {
                ...n,
                recipients: [
                  { ...n.recipients[0], viewedAtUtc: new Date().toISOString() },
                ],
              }
            : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return;
    }

    try {
      await apiClient.post(`/Rider/notifications/${recipientRecordId}/view`);
      await get().fetchNotifications(); // Refresh state from server
    } catch (error) {
      console.error("[NotificationStore] View Error:", error);
    }
  },

  acknowledgeNotification: async (recipientRecordId: string) => {
    // INTERCEPTOR: If it's transient, just filter it out from memory
    if (recipientRecordId.startsWith("transient-")) {
      const target = get().notifications.find(
        (n) => n.recipients[0].id === recipientRecordId,
      );
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.recipients[0].id !== recipientRecordId,
        ),
        unreadCount: !target?.recipients[0].viewedAtUtc
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
      return;
    }

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
  addIncomingNotification: (newNotif: any) => {
    const { notifications } = get();
    const exists = notifications.some((n) => n.id === newNotif.id);

    if (!exists) {
      set((state) => ({
        notifications: [newNotif, ...state.notifications],
        unreadCount:
          state.unreadCount + (newNotif.recipients[0]?.viewedAtUtc ? 0 : 1),
      }));
    }
  },
}));
