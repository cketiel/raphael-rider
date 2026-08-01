import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/useAuthStore";
import { RaphaelTheme } from "../../constants/Theme";

export const LoginScreen = () => {
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Estados del formulario
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleIdentify = async () => {
    if (!fullName || !phone) return;

    setLoading(true);

    setTimeout(() => {
      const mockCustomer = {
        id: 1,
        fullName: fullName,
        address: "123 Medical Way",
        city: "Miami",
        state: "FL",
        zip: "33101",
        phone: phone,
        fundingSourceId: 10,
        spaceTypeId: 1,
        gender: "Not Specified",
        created: new Date().toISOString(),
        createdBy: "System",
      };

      setAuth(mockCustomer); // This saves the data to persistent storage and changes the navigation.
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          {/* The icon of the Angel Raphael will go here in the next iteration. */}
          <View style={styles.logoPlaceholder} />
          <Text style={styles.title}>{t("welcome")}</Text>
          <Text style={styles.subtitle}>{t("identify_title")}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("full_name")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: John Doe"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("phone")}</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!fullName || !phone) && styles.buttonDisabled,
            ]}
            onPress={handleIdentify}
            disabled={loading || !fullName || !phone}
          >
            {loading ? (
              <ActivityIndicator color={RaphaelTheme.colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t("identify_btn")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RaphaelTheme.colors.background,
  },
  content: {
    flex: 1,
    padding: RaphaelTheme.spacing.l,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: RaphaelTheme.spacing.xl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: RaphaelTheme.colors.secondary,
    borderRadius: 50,
    marginBottom: RaphaelTheme.spacing.m,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
  },
  form: {
    marginTop: RaphaelTheme.spacing.m,
  },
  inputGroup: {
    marginBottom: RaphaelTheme.spacing.m,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: RaphaelTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: RaphaelTheme.colors.white,
    padding: RaphaelTheme.spacing.m,
    borderRadius: RaphaelTheme.borderRadius.m,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
  },
  button: {
    backgroundColor: RaphaelTheme.colors.primary,
    padding: RaphaelTheme.spacing.m,
    borderRadius: RaphaelTheme.borderRadius.m,
    alignItems: "center",
    marginTop: RaphaelTheme.spacing.m,
    shadowColor: RaphaelTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: {
    color: RaphaelTheme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
