import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { RaphaelTheme } from "../../constants/Theme";
import { Car } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export const TrackingMapScreen = ({ route }: any) => {
  const { tripId } = route.params || { tripId: 101 };

  // 1. Estado de la posición animada del vehículo
  const [vehiclePos] = useState(
    new AnimatedRegion({
      latitude: 25.751,
      longitude: -80.252,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }),
  );

  useEffect(() => {
    const mockCoordinates = [
      { latitude: 25.755, longitude: -80.248 },
      { latitude: 25.76, longitude: -80.24 },
      { latitude: 25.765, longitude: -80.235 },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockCoordinates.length) {
        const nextPos = mockCoordinates[index];

        // Usamos una aserción 'as any' solo para el método timing
        // para saltar la validación incorrecta de la librería.
        (vehiclePos as any)
          .timing({
            toValue: {
              latitude: nextPos.latitude,
              longitude: nextPos.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            duration: 30000,
            useNativeDriver: false, // Las animaciones de mapas no soportan driver nativo
          })
          .start();

        index++;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [vehiclePos]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 25.751,
          longitude: -80.252,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Marcador Animado del Vehículo */}
        <Marker.Animated
          coordinate={vehiclePos as any}
          title="Tu transporte"
          description="En camino"
        >
          <View style={styles.carMarker}>
            <Car
              color={RaphaelTheme.colors.white}
              size={20}
              fill={RaphaelTheme.colors.primary}
            />
          </View>
        </Marker.Animated>

        {/* Ejemplo de Ruta (Polyline) */}
        <Polyline
          coordinates={[
            { latitude: 25.751, longitude: -80.252 },
            { latitude: 25.765, longitude: -80.235 },
          ]}
          strokeColor={RaphaelTheme.colors.primary}
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Crucial: el padre debe expandirse
    backgroundColor: "white",
  },
  map: { ...StyleSheet.absoluteFill },
  carMarker: {
    backgroundColor: RaphaelTheme.colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
