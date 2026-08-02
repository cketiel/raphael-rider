import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/useAuthStore";

import { LoginScreen } from "../screens/auth/LoginScreen";
import { MainTabNavigator } from "./MainTabNavigator";

import { RootStackParamList } from "./types";
import { TrackingMapScreen } from "../screens/main/TrackingMapScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen as any} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />

            <Stack.Screen
              name="TrackingMap"
              component={TrackingMapScreen}
              options={{
                headerShown: true,
                headerTitle: "Seguimiento en Vivo",
                headerTintColor: "#007AFF",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
