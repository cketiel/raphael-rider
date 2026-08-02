import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as Linking from "expo-linking";
import {
  Phone,
  Mail,
  Globe,
  MessageSquare,
  ShieldCheck,
  Clock,
} from "lucide-react-native";
import { RaphaelTheme } from "../../constants/Theme";
import { RAPHAEL_CONTACT } from "../../constants/Config";
import { useTranslation } from "react-i18next";

export const ContactScreen = () => {
  const { t } = useTranslation();
  const handleCall = () => {
    Linking.openURL(`tel:${RAPHAEL_CONTACT.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(
      `mailto:${RAPHAEL_CONTACT.email}?subject=Raphael Rider Support`,
    );
  };

  const handleSMS = () => {
    Linking.openURL(`sms:${RAPHAEL_CONTACT.sms}`);
  };

  const handleWeb = () => {
    Linking.openURL(RAPHAEL_CONTACT.website);
  };

  const ContactCard = ({ icon: Icon, title, value, onPress, color }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ShieldCheck size={60} color={RaphaelTheme.colors.primary} />
        <Text style={styles.title}>{t("contact.title")}</Text>
        <Text style={styles.subtitle}>{t("contact.subtitle")}</Text>
      </View>

      <View style={styles.infoRow}>
        <Clock size={16} color="#64748b" />
        <Text style={styles.infoText}>
          {t("contact.hours", { hours: RAPHAEL_CONTACT.officeHours })}:
        </Text>
      </View>

      <View style={styles.grid}>
        <ContactCard
          icon={Phone}
          title={t("contact.call")}
          value={RAPHAEL_CONTACT.displayPhone}
          color={RaphaelTheme.colors.primary}
          onPress={handleCall}
        />
        <ContactCard
          icon={MessageSquare}
          title={t("contact.sms")}
          value={RAPHAEL_CONTACT.sms}
          color="#8B5CF6"
          onPress={handleSMS}
        />
        <ContactCard
          icon={Mail}
          title={t("contact.email")}
          value={RAPHAEL_CONTACT.email}
          color="#EC4899"
          onPress={handleEmail}
        />
        <ContactCard
          icon={Globe}
          title={t("contact.web")}
          value={RAPHAEL_CONTACT.website}
          color={RaphaelTheme.colors.secondary}
          onPress={handleWeb}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Raphael Ecosystem v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  content: { padding: 20 },
  header: { alignItems: "center", marginVertical: 30 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 8,
    fontWeight: "600",
  },
  grid: { gap: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: RaphaelTheme.colors.text,
    marginTop: 2,
  },
  footer: { marginTop: 40, alignItems: "center" },
  footerText: { color: "#cbd5e1", fontSize: 12 },
});
