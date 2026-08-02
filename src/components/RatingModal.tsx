import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { RaphaelTheme } from "../constants/Theme";
import { Star } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string) => void;
}

export const RatingModal = ({ visible, onClose, onSubmit }: Props) => {
  const [score, setScore] = useState<number>(10);
  const [comment, setComment] = useState("");

  const scores = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Calificar Viaje</Text>
          <Text style={styles.subtitle}>
            ¿Cómo fue su experiencia con el conductor?
          </Text>

          <View style={styles.scoreContainer}>
            <FlatList
              data={scores}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.scoreCircle,
                    score === item && styles.scoreSelected,
                  ]}
                  onPress={() => setScore(item)}
                >
                  <Text
                    style={[
                      styles.scoreText,
                      score === item && styles.scoreTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Escriba un comentario (opcional)..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text>Omitir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSubmit}
              onPress={() => onSubmit(score, comment)}
            >
              <Text style={styles.btnSubmitText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: RaphaelTheme.colors.primary,
  },
  subtitle: { textAlign: "center", color: "#64748b", marginVertical: 10 },
  scoreContainer: { height: 60, marginVertical: 15 },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  scoreSelected: { backgroundColor: RaphaelTheme.colors.secondary },
  scoreText: { fontWeight: "bold", color: "#64748b" },
  scoreTextSelected: { color: RaphaelTheme.colors.text },
  input: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
  actions: { flexDirection: "row", marginTop: 20, width: "100%" },
  btnCancel: { flex: 1, alignItems: "center", padding: 15 },
  btnSubmit: {
    flex: 1,
    backgroundColor: RaphaelTheme.colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  btnSubmitText: { color: "white", fontWeight: "bold" },
});
