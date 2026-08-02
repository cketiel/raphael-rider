import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { RaphaelTheme } from "../../constants/Theme";
import {
  User,
  Map,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Lock,
} from "lucide-react-native";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const { customer, logout } = useAuthStore();
  const { language, setLanguage, preferredMapApp, setPreferredMapApp } =
    useSettingsStore();

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState("");

  const handleEditProfile = () => {
    // En Raphael, el PIN por defecto para esta demo será '1234'
    if (pin === "1234") {
      setPinModalVisible(false);
      setPin("");
      Alert.alert("Éxito", "Modo edición activado (Simulado)");
    } else {
      Alert.alert("Error", "PIN incorrecto");
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "es" ? "en" : "es";
    setLanguage(newLang);
    //i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Está seguro?", [
      { text: "No", style: "cancel" },
      { text: "Sí", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const SettingItem = ({
    icon: Icon,
    label,
    value,
    onPress,
    showChevron = true,
  }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBg}>
          <Icon size={20} color={RaphaelTheme.colors.primary} />
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {showChevron && <ChevronRight size={20} color="#cbd5e1" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Perfil Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer?.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{customer?.fullName}</Text>
        <Text style={styles.userStatus}>{t("settings.profile")}</Text>
      </View>

      {/* Sección Cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
        <SettingItem
          icon={User}
          label={t("settings.patient_details")}
          onPress={() => setPinModalVisible(true)}
        />
        <SettingItem
          icon={Globe}
          label={t("settings.language")}
          value={language === "es" ? "Español" : "English"}
          onPress={toggleLanguage}
        />
      </View>

      {/* Sección Navegación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.preferences")}</Text>
        <SettingItem
          icon={Map}
          label={t("settings.map")}
          value={preferredMapApp.toUpperCase()}
          onPress={() => {
            Alert.alert("Seleccionar Mapa", "Elija su app preferida", [
              {
                text: "Google Maps",
                onPress: () => setPreferredMapApp("google"),
              },
              { text: "Waze", onPress: () => setPreferredMapApp("waze") },
              {
                text: "Apple Maps",
                onPress: () => setPreferredMapApp("apple"),
              },
            ]);
          }}
        />
      </View>

      {/* Sección Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raphael NEMT</Text>
        <SettingItem
          icon={Shield}
          label={t("settings.legal")}
          onPress={() => {}}
        />
        <SettingItem
          icon={Shield}
          label={t("settings.privacy")}
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={RaphaelTheme.colors.error} />
        <Text style={styles.logoutText}>{t("settings.logout")}</Text>
      </TouchableOpacity>

      {/* Modal de PIN */}
      <Modal visible={pinModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Lock
              size={40}
              color={RaphaelTheme.colors.primary}
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.modalTitle}>
              {t("settings.security_title")}
            </Text>
            <Text style={styles.modalSub}>{t("settings.security_msg")}</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="****"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              onChangeText={setPin}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setPinModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={handleEditProfile}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Validar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  header: { alignItems: "center", padding: 30, backgroundColor: "white" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
  },
  userStatus: {
    fontSize: 14,
    color: RaphaelTheme.colors.success,
    marginTop: 5,
    fontWeight: "600",
  },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 10,
  },
  item: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: RaphaelTheme.colors.text,
    fontWeight: "500",
  },
  itemRight: { flexDirection: "row", alignItems: "center" },
  itemValue: { fontSize: 14, color: "#64748b", marginRight: 8 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoutText: {
    color: RaphaelTheme.colors.error,
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalSub: { textAlign: "center", color: "#64748b", marginVertical: 10 },
  pinInput: {
    width: "100%",
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: RaphaelTheme.colors.primary,
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 10,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 25,
    width: "100%",
    justifyContent: "space-between",
  },
  btnCancel: { flex: 1, padding: 12, alignItems: "center" },
  btnConfirm: {
    flex: 1,
    padding: 12,
    backgroundColor: RaphaelTheme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
});
