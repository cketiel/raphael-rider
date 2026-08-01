import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TripStatusColors } from "../domain/types";

export const StatusBadge = ({ status }: { status: string }) => {
  const backgroundColor = TripStatusColors[status] || "#CBD5E1";
  // Lógica para texto oscuro en fondos amarillos
  const textColor = status === "Waiting" ? "#451a03" : "#FFFFFF";

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: { fontSize: 10, fontWeight: "800" },
});
