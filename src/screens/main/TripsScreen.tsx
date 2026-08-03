import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Map as MapIcon,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// Infraestructura
import { RaphaelTheme } from "../../constants/Theme";
import { Trip, Schedule, TripStatus } from "../../domain/types";
import { StatusBadge } from "../../components/StatusBadge";
import { useRatingStore } from "../../store/useRatingStore";
import { RootStackParamList } from "../../navigation/types";
import { RatingModal } from "../../components/RatingModal";
import apiClient from "../../api/apiClient";

export const TripsScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ratings, addRating } = useRatingStore();

  // --- ESTADOS DE DATOS REALES ---
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [history, setHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE VISTA ---
  const [viewMode, setViewMode] = useState<"daily" | "range">("daily");
  const [selectedTripForRating, setSelectedTripForRating] = useState<
    number | null
  >(null);

  // --- ESTADOS DE FILTROS ---
  const [singleDate, setSingleDate] = useState(new Date());
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showPicker, setShowPicker] = useState<"single" | "from" | "to" | null>(
    null,
  );

  // --- EFECTOS DE CARGA DE API ---
  useEffect(() => {
    if (viewMode === "daily") {
      loadSchedules();
    } else {
      loadHistory();
    }
  }, [viewMode, singleDate, dateFrom, dateTo]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const formattedDate = format(singleDate, "yyyy-MM-dd");
      const response = await apiClient.get(
        `/Rider/schedules?date=${formattedDate}`,
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Error cargando eventos", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const start = format(dateFrom, "yyyy-MM-dd");
      const end = format(dateTo, "yyyy-MM-dd");
      const response = await apiClient.get(
        `/Rider/history?start=${start}&end=${end}`,
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Error cargando historial", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE TRACKING ---
  const canTrack = (status: string) => {
    return status === TripStatus.InProgress || status === TripStatus.Waiting;
  };

  const renderTrackButton = (tripId?: number) => (
    <TouchableOpacity
      style={styles.mapButton}
      onPress={() => tripId && navigation.navigate("TrackingMap", { tripId })}
    >
      <MapIcon color={RaphaelTheme.colors.primary} size={16} />
      <Text style={styles.mapButtonText}>{t("common.track")}</Text>
    </TouchableOpacity>
  );

  // --- RENDERIZADORES ---
  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const isCompleted = item.performed;
    const isArrived = !!item.actualArriveTime && !item.performed;
    const color = isCompleted ? "#94a3b8" : isArrived ? "#EAB308" : "#22C55E";

    return (
      <View style={[styles.eventCard, { borderLeftColor: color }]}>
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            {isCompleted ? (
              <CheckCircle2 size={14} color={color} />
            ) : (
              <Circle size={14} color={color} />
            )}
            <Text style={[styles.statusLabel, { color }]}>
              {isCompleted
                ? t("trips.completed")
                : isArrived
                  ? t("trips.arrived")
                  : t("trips.on_route")}
            </Text>
          </View>
          <Text style={styles.typeTag}>{item.eventType}</Text>
        </View>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.timeValue}>
            {item.eventType === "Pickup"
              ? item.scheduledPickupTime
              : item.scheduledApptTime}
          </Text>
          {!isCompleted && item.tripId && renderTrackButton(item.tripId)}
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
          <Text style={styles.dateText}>
            {format(new Date(item.date), "dd/MM/yyyy")}
          </Text>
        </View>
        <Text style={styles.routeText}>
          <Text style={styles.bold}>{t("common.pickup")}:</Text>{" "}
          {item.pickupAddress}
        </Text>
        <Text style={styles.routeText}>
          <Text style={styles.bold}>{t("common.dropoff")}:</Text>{" "}
          {item.dropoffAddress}
        </Text>
        <View style={styles.divider} />
        {canTrack(item.status) && (
          <View style={{ marginBottom: 10 }}>{renderTrackButton(item.id)}</View>
        )}
        <View style={styles.historyFooter}>
          {rating ? (
            <View style={styles.ratingInfo}>
              <Star
                size={14}
                color={RaphaelTheme.colors.secondary}
                fill={RaphaelTheme.colors.secondary}
              />
              <Text style={styles.ratingText}>
                {t("trips.score")}: {rating.score}/10
              </Text>
            </View>
          ) : (
            item.status === TripStatus.Finished && (
              <TouchableOpacity
                style={styles.rateBtn}
                onPress={() => setSelectedTripForRating(item.id)}
              >
                <Text style={styles.rateBtnText}>{t("common.rate")}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowPicker(null);
    if (date) {
      if (showPicker === "single") setSingleDate(date);
      if (showPicker === "from") setDateFrom(date);
      if (showPicker === "to") setDateTo(date);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Selector de Modo */}
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
            {t("trips.daily")}
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
            {t("trips.history")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Filtros */}
      <View style={styles.filterPanel}>
        {viewMode === "daily" ? (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowPicker("single")}
          >
            <Calendar size={18} color={RaphaelTheme.colors.primary} />
            <Text style={styles.filterButtonText}>
              {t("trips.date")}: {format(singleDate, "PP")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rangeContainer}>
            <TouchableOpacity
              style={styles.filterButtonHalf}
              onPress={() => setShowPicker("from")}
            >
              <Text style={styles.filterLabel}>{t("trips.since")}:</Text>
              <Text style={styles.filterValue}>
                {format(dateFrom, "dd/MM/yy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButtonHalf}
              onPress={() => setShowPicker("to")}
            >
              <Text style={styles.filterLabel}>{t("trips.until")}:</Text>
              <Text style={styles.filterValue}>
                {format(dateTo, "dd/MM/yy")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={
            showPicker === "single"
              ? singleDate
              : showPicker === "from"
                ? dateFrom
                : dateTo
          }
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* 3. Listas Separadas para Evitar Errores de TypeScript */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={RaphaelTheme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : viewMode === "daily" ? (
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("trips.no_trips")}</Text>
          }
        />
      ) : (
        <FlatList
          data={history}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("trips.no_trips")}</Text>
          }
        />
      )}

      <RatingModal
        visible={!!selectedTripForRating}
        onClose={() => setSelectedTripForRating(null)}
        onSubmit={(s, c) => {
          addRating({
            id: Math.random(),
            tripId: selectedTripForRating!,
            customerId: 1,
            driverId: 99,
            score: s,
            comment: c,
            createdAt: new Date().toISOString(),
          });
          setSelectedTripForRating(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: RaphaelTheme.colors.primary },
  tabLabel: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  activeTabLabel: { color: "white" },
  filterPanel: { paddingHorizontal: 16, marginBottom: 8 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterButtonText: {
    marginLeft: 10,
    fontWeight: "600",
    color: RaphaelTheme.colors.text,
  },
  rangeContainer: { flexDirection: "row", justifyContent: "space-between" },
  filterButtonHalf: {
    width: "48%",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterLabel: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  filterValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  listContent: { padding: 16 },
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
    marginBottom: 12,
    alignItems: "center",
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: { fontSize: 11, fontWeight: "800", marginLeft: 5 },
  typeTag: {
    fontSize: 10,
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 4,
    color: "#64748b",
  },
  locationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  addressText: { fontSize: 13, color: "#64748b", marginTop: 4 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
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
    fontSize: 12,
  },
  tripCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  dateText: { fontSize: 12, color: "#94a3b8" },
  routeText: { fontSize: 13, color: RaphaelTheme.colors.text, marginBottom: 4 },
  bold: { fontWeight: "bold", color: "#1e293b" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  historyFooter: { minHeight: 40, justifyContent: "center" },
  rateBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RaphaelTheme.colors.primary,
    alignItems: "center",
  },
  rateBtnText: { color: RaphaelTheme.colors.primary, fontWeight: "bold" },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 8,
  },
  ratingText: {
    color: "#B45309",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
  },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
});
