import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { signalRService } from "../services/signalRService";

// Encapsular esta lógica en un Hook para que la conexión solo exista mientras el usuario esté autenticado.
export const useSignalR = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      signalRService.startConnection();
    } else {
      signalRService.stopConnection();
    }

    return () => {
      // No desconectamos al desmontar componentes pequeños,
      // solo cuando el estado de auth cambie.
    };
  }, [isAuthenticated]);
};
