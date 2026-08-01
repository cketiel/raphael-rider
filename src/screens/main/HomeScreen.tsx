import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { RaphaelTheme } from "../../constants/Theme";

export const HomeScreen = () => {
  const customer = useAuthStore((state) => state.customer);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hola, {customer?.fullName}</Text>
        <Text style={styles.statusLabel}>Conectado como Paciente</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RaphaelTheme.colors.background },
  header: {
    padding: 24,
    backgroundColor: RaphaelTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
  },
  statusLabel: { fontSize: 14, color: "#64748b", marginTop: 4 },
});
