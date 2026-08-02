import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNotificationStore } from "../../store/useNotificationStore";
import { RaphaelTheme } from "../../constants/Theme";
import { NotificationLevel } from "../../domain/types";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Trash2,
} from "lucide-react-native";
import { format } from "date-fns";

export const NotificationsScreen = () => {
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const getLevelStyles = (level: NotificationLevel) => {
    switch (level) {
      case NotificationLevel.Alert:
        return {
          color: RaphaelTheme.colors.error,
          icon: <AlertTriangle color={RaphaelTheme.colors.error} size={20} />,
        };
      case NotificationLevel.Warning:
        return { color: "#EAB308", icon: <Bell color="#EAB308" size={20} /> };
      default:
        return {
          color: RaphaelTheme.colors.primary,
          icon: <Info color={RaphaelTheme.colors.primary} size={20} />,
        };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const { color, icon } = getLevelStyles(item.level);

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color }]}>{item.title}</Text>
            <Text style={styles.time}>
              {format(new Date(item.date), "HH:mm")}
            </Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Text style={styles.countText}>
          {notifications.length} notificaciones
        </Text>
        <TouchableOpacity onPress={clearAll}>
          <Trash2 size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <CheckCircle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No tienes avisos pendientes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  countText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: RaphaelTheme.colors.primary,
  },
  iconContainer: { marginRight: 12, paddingTop: 2 },
  content: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { fontSize: 15, fontWeight: "bold" },
  time: { fontSize: 11, color: "#94a3b8" },
  message: { fontSize: 13, color: "#475569", lineHeight: 18 },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 12, color: "#94a3b8", fontSize: 16 },
});
