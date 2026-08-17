import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import {
  Home,
  Calendar,
  Bell,
  Settings,
  Headphones,
} from "lucide-react-native";

// Infrastructure & State
import { RaphaelTheme } from "../constants/Theme";
import { useNotificationStore } from "../store/useNotificationStore";

// Screens
import { HomeScreen } from "../screens/main/HomeScreen";
import { TripsScreen } from "../screens/main/TripsScreen";
import { NotificationsScreen } from "../screens/main/NotificationsScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { ContactScreen } from "../screens/main/ContactScreen";

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator Component
 * Defines the primary navigation structure once the user is authenticated.
 * Features a dynamic badge for the Notifications tab based on the unread count.
 */
export const MainTabNavigator = () => {
  const { t } = useTranslation();

  // Reactive subscription to the unread notification count
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: RaphaelTheme.colors.primary,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: "white",
          elevation: 2,
          shadowOpacity: 0.1,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: RaphaelTheme.colors.primary,
        },
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: t("tabs.home"),
        }}
      />

      {/* Trips/History Tab */}
      <Tab.Screen
        name="MyTrips"
        component={TripsScreen}
        options={{
          tabBarLabel: t("tabs.trips"),
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
          headerTitle: t("tabs.trips"),
        }}
      />

      {/* Real-time Notifications Tab with Dynamic Badge */}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: t("tabs.notifs"),
          // Logic: Only show the badge if count > 0, otherwise hide it (undefined)
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: RaphaelTheme.colors.error,
            color: "white",
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          headerTitle: t("notifs.title"),
        }}
      />

      {/* Contact & Support Tab */}
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarLabel: t("tabs.contact"),
          tabBarIcon: ({ color, size }) => (
            <Headphones color={color} size={size} />
          ),
          headerTitle: t("contact.title"),
        }}
      />

      {/* User Settings Tab */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t("tabs.settings"),
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
          headerTitle: t("tabs.settings"),
        }}
      />
    </Tab.Navigator>
  );
};
