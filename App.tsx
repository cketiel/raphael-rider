import "./src/i18n";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useSignalR } from "./src/hooks/useSignalR";

export default function App() {
  // Inicializa la escucha de tiempo real en toda la app
  useSignalR();
  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}
