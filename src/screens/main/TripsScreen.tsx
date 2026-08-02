import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Map as MapIcon,
  Star,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react-native";

// Dominio, Temas y Stores
import { RaphaelTheme } from "../../constants/Theme";
import { Trip, Schedule, TripStatus } from "../../domain/types";
import { MOCK_TRIPS, MOCK_SCHEDULES } from "../../services/mockData";
import { StatusBadge } from "../../components/StatusBadge";
import { useRatingStore } from "../../store/useRatingStore";
import { RootStackParamList } from "../../navigation/types";
import { RatingModal } from "../../components/RatingModal";

export const TripsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ratings, addRating } = useRatingStore();

  const [viewMode, setViewMode] = useState<"daily" | "range">("daily");
  const [selectedTripForRating, setSelectedTripForRating] = useState<
    number | null
  >(null);

  // --- LÓGICA DE NEGOCIO: COLORES DE EVENTOS ---
  const getScheduleStatus = (item: Schedule) => {
    if (item.performed) {
      return {
        label: "Completed",
        color: "#94a3b8",
        icon: <CheckCircle2 size={16} color="#94a3b8" />,
      };
    }
    if (item.actualArriveTime) {
      return {
        label: "Arrive",
        color: "#EAB308",
        icon: <Clock size={16} color="#EAB308" />,
      };
    }
    return {
      label: "On Route",
      color: "#22C55E",
      icon: <Circle size={16} color="#22C55E" />,
    };
  };

  const handleRatingSubmit = (score: number, comment: string) => {
    if (selectedTripForRating) {
      addRating({
        id: Math.random(),
        tripId: selectedTripForRating,
        customerId: 1,
        driverId: 99,
        score,
        comment,
        createdAt: new Date().toISOString(),
      });
      setSelectedTripForRating(null);
    }
  };

  // --- RENDERIZADORES ESPECÍFICOS ---

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const status = getScheduleStatus(item);
    return (
      <View style={[styles.eventCard, { borderLeftColor: status.color }]}>
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            {status.icon}
            <Text style={[styles.statusLabel, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.typeTag}>{item.eventType}</Text>
        </View>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.timeLabel}>Programado:</Text>
            <Text style={styles.timeValue}>
              {item.eventType === "Pickup"
                ? item.scheduledPickupTime
                : item.scheduledApptTime}
            </Text>
          </View>
          {!item.performed && item.tripId && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() =>
                navigation.navigate("TrackingMap", { tripId: item.tripId! })
              }
            >
              <MapIcon color={RaphaelTheme.colors.primary} size={16} />
              <Text style={styles.mapButtonText}>Seguimiento</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const rating = ratings[item.id];
    return (
      <View style={styles.tripCard}>
        <View style={styles.cardHeader}>
          <StatusBadge status={item.status} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>
            <Text style={styles.bold}>Desde:</Text> {item.pickupAddress}
          </Text>
          <Text style={styles.routeText}>
            <Text style={styles.bold}>Hacia:</Text> {item.dropoffAddress}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.historyFooter}>
          {rating ? (
            <View style={styles.ratingInfo}>
              <Star
                size={16}
                color={RaphaelTheme.colors.secondary}
                fill={RaphaelTheme.colors.secondary}
              />
              <Text style={styles.ratingText}>{rating.score}/10</Text>
              {rating.comment && (
                <Text style={styles.commentPreview} numberOfLines={1}>
                  "{rating.comment}"
                </Text>
              )}
            </View>
          ) : (
            item.status === TripStatus.Finished && (
              <TouchableOpacity
                style={styles.rateBtn}
                onPress={() => setSelectedTripForRating(item.id)}
              >
                <Text style={styles.rateBtnText}>Calificar Conductor</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "daily" && styles.activeTab]}
          onPress={() => setViewMode("daily")}
        >
          <Text
            style={[
              styles.tabLabel,
              viewMode === "daily" && styles.activeTabLabel,
            ]}
          >
            Hoy (Eventos)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === "range" && styles.activeTab]}
          onPress={() => setViewMode("range")}
        >
          <Text
            style={[
              styles.tabLabel,
              viewMode === "range" && styles.activeTabLabel,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOLUCIÓN AL ERROR: Separamos los FlatLists para asegurar el tipado */}
      {viewMode === "daily" ? (
        <FlatList
          data={MOCK_SCHEDULES}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={MOCK_TRIPS}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <RatingModal
        visible={!!selectedTripForRating}
        onClose={() => setSelectedTripForRating(null)}
        onSubmit={handleRatingSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  listContent: { padding: 16 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: RaphaelTheme.colors.primary },
  tabLabel: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  activeTabLabel: { color: "white" },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  typeTag: {
    fontSize: 10,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: "#64748b",
    fontWeight: "bold",
  },
  locationName: {
    fontSize: 17,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  addressText: { fontSize: 14, color: "#64748b", marginTop: 4 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 15,
  },
  timeLabel: { fontSize: 11, color: "#94a3b8" },
  timeValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapButtonText: {
    color: RaphaelTheme.colors.primary,
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 13,
  },
  tripCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  dateText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  routeContainer: { marginVertical: 12 },
  routeText: { fontSize: 13, color: RaphaelTheme.colors.text, marginBottom: 4 },
  bold: { fontWeight: "bold", color: "#1e293b" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  historyFooter: { minHeight: 30, justifyContent: "center" },
  rateBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RaphaelTheme.colors.primary,
    alignItems: "center",
  },
  rateBtnText: { color: RaphaelTheme.colors.primary, fontWeight: "bold" },
  ratingInfo: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontWeight: "bold", marginLeft: 5, color: "#B45309" },
  commentPreview: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },
});
