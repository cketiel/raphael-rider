import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Raphael",
      identify_title: "Identify Yourself",
      full_name: "Full Name",
      phone: "Phone Number",
      identify_btn: "Identify",
      settings: "Settings",
      language: "Language",
      my_trips: "My Trips",
    },
  },
  es: {
    translation: {
      welcome: "Bienvenido a Raphael",
      identify_title: "Identifíquese",
      full_name: "Nombre Completo",
      phone: "Número de Teléfono",
      identify_btn: "Identificarme",
      settings2: "Ajustes",
      language: "Idioma",
      my_trips: "Mis Viajes",
      settings: {
        profile: "Mi Perfil",
        edit_profile: "Editar Datos",
        enter_pin: "Ingrese su PIN para editar",
        language: "Idioma",
        preferred_map: "Aplicación de Mapas",
        legal: "Información Legal",
        privacy: "Política de Privacidad",
        logout: "Cerrar Sesión",
        connected_as: "Conectado como paciente",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // Original language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
