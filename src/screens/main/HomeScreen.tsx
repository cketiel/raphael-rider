import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  BellRing,
  User,
  MapPin,
  ShieldCheck,
  XCircle,
  Clock,
  Info,
} from "lucide-react-native";

// Internal Infrastructure & Constants
import { useAuthStore } from "../../store/useAuthStore";
import { RaphaelTheme } from "../../constants/Theme";
import apiClient from "../../api/apiClient";
import { Trip, TripStatus } from "../../domain/types";

/**
 * HomeScreen Component
 * Serves as the primary dashboard for the patient.
 * Provides real-time context of the current trip and quick access to critical actions.
 */
export const HomeScreen = () => {
  const { t } = useTranslation();
  const customer = useAuthStore((state) => state.customer);

  // Component State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  /**
   * Fetches the most relevant trip for the current day.
   * Business Logic:
   * 1. Request trips within the range of [today, today].
   * 2. Filter out terminal statuses (Finished, Canceled, Billed, Payed).
   * 3. Sort by 'fromTime' to identify the immediate next trip.
   */
  const loadCurrentTripData = async () => {
    setIsLoading(true);
    try {
      const todayDate = format(new Date(), "yyyy-MM-dd");

      // Query the backend using the history endpoint filtered for today
      const response = await apiClient.get(
        `/Rider/history?start=${todayDate}&end=${todayDate}`,
      );
      const trips: Trip[] = response.data;

      // Define terminal statuses that signify a trip is no longer actionable for the patient
      const terminalStatuses: string[] = [
        TripStatus.Finished,
        TripStatus.Canceled,
        TripStatus.Billed,
        TripStatus.Payed,
      ];

      // Identify the first non-completed/non-canceled trip ordered by pickup time
      const nextActiveTrip = trips
        .filter((trip) => !terminalStatuses.includes(trip.status))
        .sort((a, b) => (a.fromTime || "").localeCompare(b.fromTime || ""))[0];

      setActiveTrip(nextActiveTrip || null);
    } catch (error) {
      console.error("[HomeScreen] Error fetching current trip:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load on component mount
  useEffect(() => {
    loadCurrentTripData();
  }, []);

  /**
   * Pull-to-refresh handler
   */
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadCurrentTripData();
  }, []);

  // Action Eligibility Checks based on Backend Business Rules
  const isWillCallEnabled = activeTrip?.willCall === true;

  const isCancelAllowed =
    activeTrip &&
    [TripStatus.Accepted, TripStatus.Assigned, TripStatus.Scheduled].includes(
      activeTrip.status as TripStatus,
    );

  /**
   * Triggers the Will Call activation process.
   * Notifies dispatchers that the patient is ready for pickup.
   */
  const handleWillCallActivation = () => {
    if (!activeTrip) return;

    Alert.alert(
      t("home.will_call_alert_title"),
      t("home.will_call_alert_msg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("home.will_call_confirm"),
          onPress: async () => {
            try {
              await apiClient.post(
                `/Rider/trips/${activeTrip.id}/activate-will-call`,
              );
              Alert.alert("Raphael", t("home.will_call_success"));
              loadCurrentTripData(); // Refresh UI to reflect status change
            } catch (e) {
              Alert.alert(
                "Error",
                "Will Call activation failed. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  /**
   * Triggers the trip cancellation process.
   * Only allowed for trips in non-started states.
   */
  const handleTripCancellation = () => {
    if (!activeTrip) return;

    Alert.alert(t("home.confirm_cancel_title"), t("home.confirm_cancel_msg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.post(`/Rider/trips/${activeTrip.id}/cancel-trip`);
            Alert.alert("Raphael", t("home.cancel_success"));
            loadCurrentTripData(); // Refresh UI to clear the canceled trip
          } catch (e) {
            Alert.alert(
              "Error",
              "Trip cancellation failed. Please contact support.",
            );
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* 1. Status Header Section */}
      <View style={styles.statusHeader}>
        <View style={styles.statusBadge}>
          <ShieldCheck color={RaphaelTheme.colors.success} size={16} />
          <Text style={styles.statusText}>{t("home.status_connected")}</Text>
        </View>
        <Text style={styles.welcomeText}>
          {t("home.welcome_user", { name: customer?.fullName })}
        </Text>
      </View>

      {/* 2. Current Active Trip Card (Contextual Information) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("trips.daily")}</Text>
        {isLoading && !isRefreshing ? (
          <ActivityIndicator color={RaphaelTheme.colors.primary} />
        ) : activeTrip ? (
          <View style={styles.activeTripCard}>
            <View style={styles.tripInfoRow}>
              <Clock size={18} color={RaphaelTheme.colors.primary} />
              <Text style={styles.tripTime}>
                {activeTrip.fromTime?.substring(0, 5)}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: activeTrip.willCall
                      ? "#FEF3C7"
                      : "#E0F2FE",
                  },
                ]}
              >
                <Text style={styles.statusIndicatorText}>
                  {activeTrip.willCall
                    ? "WILL CALL"
                    : t(`status.${activeTrip.status}`)}
                </Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.tripAddress} numberOfLines={1}>
                {activeTrip.pickupAddress}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noTripCard}>
            <Info size={20} color="#94a3b8" />
            <Text style={styles.noTripText}>{t("home.no_active_trip")}</Text>
          </View>
        )}
      </View>

      {/* 3. Quick Actions Section (Buttons) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("home.quick_actions")}</Text>
        <View style={styles.actionGrid}>
          {/* Will Call Activation Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isWillCallEnabled && styles.actionDisabled,
            ]}
            onPress={handleWillCallActivation}
            disabled={!isWillCallEnabled}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isWillCallEnabled ? "#FEF3C7" : "#f1f5f9" },
              ]}
            >
              <BellRing
                color={isWillCallEnabled ? "#D97706" : "#cbd5e1"}
                size={28}
              />
            </View>
            <Text style={styles.actionLabel}>
              {t("home.activate_will_call")}
            </Text>
          </TouchableOpacity>

          {/* Cancellation Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isCancelAllowed && styles.actionDisabled,
            ]}
            onPress={handleTripCancellation}
            disabled={!isCancelAllowed}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isCancelAllowed ? "#FEE2E2" : "#f1f5f9" },
              ]}
            >
              <XCircle
                color={isCancelAllowed ? "#EF4444" : "#cbd5e1"}
                size={28}
              />
            </View>
            <Text style={styles.actionLabel}>{t("home.cancel_trip")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Patient Profile Data Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("home.my_data")}</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={18} color="#64748b" />
            <Text style={styles.infoText}>{customer?.fullName}</Text>
          </View>
          <Text style={styles.idText}>
            {t("home.member_id")}: {customer?.id}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  statusHeader: {
    padding: 24,
    backgroundColor: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    color: RaphaelTheme.colors.success,
    fontWeight: "600",
    marginLeft: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: RaphaelTheme.colors.text,
    marginBottom: 12,
  },

  // Active Trip Component Styles
  activeTripCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: RaphaelTheme.colors.primary,
  },
  tripInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  tripTime: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: RaphaelTheme.colors.text,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 15,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  locationRow: { flexDirection: "row", alignItems: "center" },
  tripAddress: { fontSize: 13, color: "#64748b", marginLeft: 5, flex: 1 },

  // Empty State Styles
  noTripCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    flexDirection: "row",
    justifyContent: "center",
  },
  noTripText: { color: "#94a3b8", fontSize: 14, marginLeft: 10 },

  // Action Button Grid Styles
  actionGrid: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    backgroundColor: "white",
    width: "48%",
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    elevation: 3,
  },
  actionDisabled: { opacity: 0.5 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
    textAlign: "center",
  },

  // Profile Preview Styles
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: {
    fontSize: 15,
    color: RaphaelTheme.colors.text,
    marginLeft: 10,
    fontWeight: "600",
  },
  idText: { fontSize: 12, color: "#94a3b8", marginTop: 10, marginLeft: 28 },
});
