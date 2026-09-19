import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/storageKeys";

const baseURL = Constants.expoConfig?.extra?.apiUrl;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ⚠️ A separate axios instance on purpose. The renewal call must NOT pass through the
 * interceptors below, or a refresh that comes back 401 would try to refresh itself.
 */
const renewalClient = axios.create({ baseURL, timeout: 30000 });

/**
 * The renewal in flight, if any.
 *
 * ⚠️ One at a time, and it is correctness rather than tidiness. The trips screen, the
 * notification store and the live-location poll all get their 401 in the same second, and each
 * renewal rotates the refresh token — so unserialised attempts would present a token the server
 * has just replaced, which is its definition of a stolen credential. It answers by ending the
 * session, which would sign a patient out for having several things on screen at once.
 */
let renewal: Promise<string | null> | null = null;

async function renewSession(): Promise<string | null> {
  if (!renewal) {
    renewal = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          return null;
        }

        const { data } = await renewalClient.post("/Auth/refresh", { refreshToken });

        if (!data?.token) {
          return null;
        }

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.token);

        // Single use: the one just spent is dead, and keeping it would make the next renewal
        // look like a replay.
        if (data.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        return data.token as string;
      } catch {
        // ⚠️ Includes "there was no network". That is not an expired session and must not sign
        // anybody out — a patient on a phone loses signal far more often than a token is
        // stolen. The caller gets null, the original 401 surfaces, and the next request tries
        // again once there is a connection.
        return null;
      } finally {
        renewal = null;
      }
    })();
  }

  return renewal;
}

// INTERCEPTOR DE PETICIÓN: inyecta el JWT y dice qué aplicación es
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⚠️ "Rider" is matched case-insensitively against two sections of the server's
    // configuration: ClientCompatibility:MinimumVersions and SessionPolicy:Apps. A different
    // spelling is not an error anywhere — it silently means "never reported as outdated" and
    // "the default session policy".
    config.headers["X-Client-App"] = "Rider";
    config.headers["X-Client-Version"] = Constants.expoConfig?.version ?? "";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// INTERCEPTOR DE RESPUESTA: renueva la sesión antes de rendirse
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      // Once, never in a loop: a 401 that survives a fresh token is not about the token.
      original._retried = true;

      const token = await renewSession();

      if (token) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      }

      // Only now is the session really over. Until this change the 401 was written to the
      // console and nothing else, so a patient whose token had expired sat looking at a screen
      // that failed silently and never said why.
      //
      // Imported here rather than at the top so this module never depends on the store at load
      // time.
      const { useAuthStore } = await import("../store/useAuthStore");
      await useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
