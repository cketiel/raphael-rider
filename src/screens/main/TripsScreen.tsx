import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RaphaelTheme } from "../../constants/Theme";
import { MOCK_TRIPS, MOCK_SCHEDULES } from "../../services/mockData";
import { StatusBadge } from "../../components/StatusBadge";
import { Schedule } from "../../domain/types";
import {
  Map as MapIcon,
  Circle,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

export const TripsScreen = () => {
  const [viewMode, setViewMode] = useState<"daily" | "range">("daily");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getScheduleStatus = (item: Schedule) => {
    if (item.performed)
      return {
        label: "Completed",
        color: "#94a3b8",
        icon: <CheckCircle2 size={16} color="#94a3b8" />,
      };
    if (item.actualArriveTime)
      return {
        label: "Arrive",
        color: "#EAB308",
        icon: <Clock size={16} color="#EAB308" />,
      };
    return {
      label: "On Route",
      color: "#22C55E",
      icon: <Circle size={16} color="#22C55E" />,
    };
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const status = getScheduleStatus(item);
    return (
      <View style={[styles.eventCard, { borderLeftColor: status.color }]}>
        <View style={styles.eventHeader}>
          <View style={styles.statusRow}>
            {status.icon}
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.eventTime}>{item.eventType}</Text>
        </View>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventAddress}>{item.address}</Text>

        {!item.performed && item.tripId && (
          <TouchableOpacity
            style={styles.miniMapButton}
            onPress={() =>
              navigation.navigate("TrackingMap", { tripId: item.tripId! })
            }
          >
            <MapIcon color={RaphaelTheme.colors.primary} size={14} />
            <Text style={styles.miniMapText}>Seguimiento</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "daily" && styles.activeTab]}
          onPress={() => setViewMode("daily")}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "daily" && styles.activeTabText,
            ]}
          >
            Eventos (Hoy)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === "range" && styles.activeTab]}
          onPress={() => setViewMode("range")}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "range" && styles.activeTabText,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "daily" ? (
        <FlatList
          data={MOCK_SCHEDULES}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <FlatList
          data={MOCK_TRIPS}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <View style={styles.cardHeader}>
                <StatusBadge status={item.status} />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <Text style={styles.addressText}>
                Desde: {item.pickupAddress}
              </Text>
              <Text style={styles.addressText}>
                Hacia: {item.dropoffAddress}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 4,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: RaphaelTheme.colors.primary },
  tabText: { fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#fff" },

  // Estilos de Evento (Schedule)
  eventCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 5,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 12, fontWeight: "bold", marginLeft: 5 },
  eventTime: { fontSize: 11, color: "#94a3b8", fontWeight: "bold" },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  eventAddress: { fontSize: 13, color: "#64748b", marginTop: 4 },

  // Estilos de Viaje (History)
  tripCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateText: { fontSize: 12, color: "#94a3b8" },
  addressText: {
    fontSize: 13,
    color: RaphaelTheme.colors.text,
    marginBottom: 4,
  },

  miniMapButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    alignSelf: "flex-start",
  },
  miniMapText: {
    color: RaphaelTheme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 5,
  },
});
