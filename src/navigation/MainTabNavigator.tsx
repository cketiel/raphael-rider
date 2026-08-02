import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  Calendar,
  Headphones,
  Bell,
  Settings,
} from "lucide-react-native";
import { RaphaelTheme } from "../constants/Theme";

// Screens
import { HomeScreen } from "../screens/main/HomeScreen";
import { TripsScreen } from "../screens/main/TripsScreen";
import { ContactScreen } from "../screens/main/ContactScreen";
import { NotificationsScreen } from "../screens/main/NotificationsScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { t } = useTranslation();
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
        name={t("tabs.home")}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: t("tabs.home"),
        }}
      />
      <Tab.Screen
        name={t("tabs.trips")}
        component={TripsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
          tabBarLabel: t("tabs.trips"),
        }}
      />
      <Tab.Screen
        name={t("tabs.contact")}
        component={ContactScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Headphones color={color} size={size} />
          ),
          tabBarLabel: t("tabs.contact"),
        }}
      />
      <Tab.Screen
        name={t("notifs.title")}
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: 3, // Example of a pending notification
          tabBarLabel: t("tabs.notifs"),
        }}
      />
      <Tab.Screen
        name={t("tabs.settings")}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
          tabBarLabel: t("tabs.settings"),
        }}
      />
    </Tab.Navigator>
  );
};
