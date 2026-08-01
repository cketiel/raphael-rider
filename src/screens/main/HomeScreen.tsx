import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { RaphaelTheme } from "../../constants/Theme";
import {
  PlusCircle,
  BellRing,
  User,
  MapPin,
  ShieldCheck,
} from "lucide-react-native";

export const HomeScreen = () => {
  const customer = useAuthStore((state) => state.customer);

  const handleSolicitarViaje = () => {
    Alert.alert(
      "Próximamente",
      "La funcionalidad de solicitar nuevos viajes estará disponible en la próxima versión.",
    );
  };

  const handleActivarWillCall = () => {
    Alert.alert(
      "Activar Will Call",
      "¿Está listo para ser recogido ahora? Esto notificará a su conductor inmediatamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, estoy listo",
          onPress: () =>
            console.log(
              "Will Call activado: Generando alerta para Driver/Dispatcher",
            ),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header de Estado */}
      <View style={styles.statusHeader}>
        <View style={styles.statusBadge}>
          <ShieldCheck color={RaphaelTheme.colors.success} size={16} />
          <Text style={styles.statusText}>Paciente Identificado</Text>
        </View>
        <Text style={styles.welcomeText}>Hola, {customer?.fullName}</Text>
      </View>

      {/* 2. Acciones Principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSolicitarViaje}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#E0F2FE" }]}
            >
              <PlusCircle color={RaphaelTheme.colors.primary} size={28} />
            </View>
            <Text style={styles.actionLabel}>Solicitar Viaje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleActivarWillCall}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}
            >
              <BellRing color="#D97706" size={28} />
            </View>
            <Text style={styles.actionLabel}>Activar Will Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Información del Paciente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Datos</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={20} color="#64748b" />
            <Text style={styles.infoText}>{customer?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#64748b" />
            <Text style={styles.infoText}>
              {customer?.address}, {customer?.city}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoSubtext}>
              ID de Miembro: {customer?.id}
            </Text>
            <Text style={styles.infoSubtext}>Tel: {customer?.phone}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RaphaelTheme.colors.background,
  },
  statusHeader: {
    padding: 24,
    backgroundColor: RaphaelTheme.colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    fontSize: 24,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: RaphaelTheme.colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: RaphaelTheme.colors.white,
    width: "48%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: RaphaelTheme.colors.text,
  },
  infoCard: {
    backgroundColor: RaphaelTheme.colors.white,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: RaphaelTheme.colors.text,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  infoSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    flex: 1,
  },
});
