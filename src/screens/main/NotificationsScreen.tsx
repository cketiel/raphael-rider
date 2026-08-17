import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Bell,
  Check,
  Inbox,
  Info,
  AlertTriangle,
  X,
  ChevronRight,
  MailOpen,
  Mail,
} from "lucide-react-native";
import { format } from "date-fns";

import { useNotificationStore } from "../../store/useNotificationStore";
import { RaphaelTheme } from "../../constants/Theme";
import { NotificationDto } from "../../domain/types";

export const NotificationsScreen = () => {
  const { t } = useTranslation();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsViewed,
    acknowledgeNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [selectedNotif, setSelectedNotif] = useState<NotificationDto | null>(
    null,
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Compute summary stats to avoid re-renders
  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.recipients[0]?.viewedAtUtc).length,
    }),
    [notifications],
  );

  /**
   * Maps backend severity to UI visual cues
   */
  const getSeverityStyle = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === "CRITICAL" || s === "ERROR") {
      return {
        color: RaphaelTheme.colors.error,
        icon: AlertTriangle,
        bg: "#FEF2F2",
      };
    }
    if (s === "WARNING") {
      return { color: "#EAB308", icon: Bell, bg: "#FEFCE8" };
    }
    return { color: RaphaelTheme.colors.primary, icon: Info, bg: "#F0F9FF" };
  };

  /**
   * Opens detail view and marks as read if necessary
   */
  const handleOpenDetail = (item: NotificationDto) => {
    setSelectedNotif(item);
    if (!item.recipients[0]?.viewedAtUtc) {
      markAsViewed(item.recipients[0].id);
    }
  };

  const renderItem = ({ item }: { item: NotificationDto }) => {
    const recipient = item.recipients[0];
    const isUnread = !recipient?.viewedAtUtc;
    const severity = getSeverityStyle(item.severity);
    const Icon = severity.icon;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handleOpenDetail(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: severity.bg }]}>
          <Icon size={22} color={severity.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.itemHeader}>
            <Text
              style={[styles.title, isUnread && styles.boldText]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.time}>
              {format(new Date(item.createdAtUtc), "HH:mm")}
            </Text>
          </View>
          <Text style={styles.messageSnippet} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
          {isUnread && <View style={styles.unreadDot} />}
          <ChevronRight size={18} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Summary Header */}
      <View style={styles.summaryHeader}>
        <View>
          <Text style={styles.summaryTitle}>{t("notifs.subtitle")}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>
              {t("notifs.summary_total", { count: stats.total })}
            </Text>
            <View style={styles.statDivider} />
            <Text
              style={[styles.statLabel, { color: RaphaelTheme.colors.primary }]}
            >
              {t("notifs.summary_unread", { count: stats.unread })}
            </Text>
          </View>
        </View>
        {stats.total > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={clearAllNotifications}
          >
            <Trash2 size={16} color={RaphaelTheme.colors.error} />
            <Text style={styles.clearBtnText}>{t("notifs.clear_all")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotifications}
            tintColor={RaphaelTheme.colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Inbox size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>{t("notifs.empty")}</Text>
            </View>
          ) : null
        }
      />

      {/* 3. Professional Detail Modal */}
      <Modal visible={!!selectedNotif} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>
                {t("notifs.detail_title")}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedNotif(null)}
                style={styles.closeBtn}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedNotif && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalMeta}>
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityText}>
                      {selectedNotif.severity}
                    </Text>
                  </View>
                  <Text style={styles.modalDate}>
                    {format(new Date(selectedNotif.createdAtUtc), "PPP p")}
                  </Text>
                </View>

                <Text style={styles.modalSubject}>{selectedNotif.title}</Text>
                <Text style={styles.modalFullMessage}>
                  {selectedNotif.message}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => {
                      acknowledgeNotification(selectedNotif.recipients[0].id);
                      setSelectedNotif(null);
                    }}
                  >
                    <Trash2 size={20} color="white" />
                    <Text style={styles.deleteActionText}>
                      {t("notifs.delete")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  // Summary Header Styles
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 8,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  clearBtnText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "bold",
    color: RaphaelTheme.colors.error,
  },

  // List Styles
  list: { padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  unreadCard: {
    backgroundColor: "#F8FAFF",
    borderLeftWidth: 4,
    borderLeftColor: RaphaelTheme.colors.primary,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1, marginLeft: 16 },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    color: RaphaelTheme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  boldText: { fontWeight: "bold" },
  time: { fontSize: 11, color: "#94a3b8" },
  messageSnippet: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  indicatorContainer: { alignItems: "center", marginLeft: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RaphaelTheme.colors.primary,
    marginBottom: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "80%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1 },
  modalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  severityText: { fontSize: 10, fontWeight: "bold", color: "#64748b" },
  modalDate: { fontSize: 12, color: "#94a3b8" },
  modalSubject: {
    fontSize: 24,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
    marginBottom: 15,
  },
  modalFullMessage: { fontSize: 16, color: "#475569", lineHeight: 26 },
  modalActions: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
  },
  deleteAction: {
    flexDirection: "row",
    backgroundColor: RaphaelTheme.colors.error,
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionText: { color: "white", fontWeight: "bold", marginLeft: 10 },

  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 12, color: "#94a3b8", fontSize: 16 },
});
