import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Calendar, Bell, Settings } from "lucide-react-native";
import { RaphaelTheme } from "../constants/Theme";

// Screens
import { HomeScreen } from "../screens/main/HomeScreen";
import { TripsScreen } from "../screens/main/TripsScreen";
import { NotificationsScreen } from "../screens/main/NotificationsScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: RaphaelTheme.colors.primary,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: { height: 65, paddingBottom: 10 },
        headerStyle: { backgroundColor: RaphaelTheme.colors.white },
        headerTitleStyle: {
          fontWeight: "bold",
          color: RaphaelTheme.colors.primary,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Mis Viajes"
        component={TripsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Avisos"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: 3, // Example of a pending notification
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
