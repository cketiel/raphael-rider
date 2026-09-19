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
let renewal: Promise<RenewalOutcome> | null = null;

/**
 * What came of trying to renew. Three outcomes and not `string | null`, because two of them
 * used to be the same value and the difference is a patient's session.
 *
 * ⚠️ "The server said no" and "I could not reach the server" both returned null, and the
 * interceptor called logout() on null. So a 409, a 500 or a lost signal signed the patient
 * out. The comment in the catch below already said that must not happen, and the code under
 * it did it anyway. Found on the Driver on 2026-09-19, where it threw drivers back to the
 * sign-in screen the moment they signed in against a server that was still waking up.
 */
type RenewalOutcome =
  | { status: "renewed"; token: string }
  | { status: "session-over" }
  | { status: "unavailable" };

/**
 * What a failed renewal means for the session.
 *
 * ⚠️ **409 is not a failure.** The backend answers `rotated_recently` with Conflict precisely
 * so a client does not send the user to the sign-in screen — `AuthController.Refresh` says so
 * in as many words: "401 tells a client to send the user back to the login screen, and this is
 * the one failure where it must not". It means another request renewed with this same refresh
 * token seconds ago, so the answer is to use whatever is stored now.
 *
 * ⚠️ **Only an answer about the credential ends a session.** 401 and 403 are the server
 * refusing the refresh token. A 500 while it is still starting, a 429 from the rate limiter, a
 * timeout, no signal at all — none of those say anything about the session.
 */
async function classifyFailure(status: number | undefined): Promise<RenewalOutcome> {
  if (status === 409) {
    const stored = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    return stored
      ? { status: "renewed", token: stored }
      : { status: "unavailable" };
  }

  if (status === 401 || status === 403) {
    return { status: "session-over" };
  }

  return { status: "unavailable" };
}

async function renewSession(): Promise<RenewalOutcome> {
  if (!renewal) {
    renewal = (async (): Promise<RenewalOutcome> => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          // Nothing to renew with. Signing in again is the only way on from here.
          return { status: "session-over" };
        }

        const { data } = await renewalClient.post("/Auth/refresh", { refreshToken });

        if (!data?.token) {
          // A 200 with nothing usable in it is the server misbehaving, not the session ending.
          return { status: "unavailable" };
        }

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.token);

        // Single use: the one just spent is dead, and keeping it would make the next renewal
        // look like a replay.
        if (data.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        return { status: "renewed", token: data.token as string };
      } catch (error) {
        // ⚠️ Includes "there was no network", which axios reports with no response at all.
        // That is not an expired session and must not sign anybody out — a patient on a phone
        // loses signal far more often than a token is stolen. Everything that is not the
        // server refusing the credential leaves the session alone: the original 401 surfaces
        // and the next request tries again.
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        return classifyFailure(status);
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

      const outcome = await renewSession();

      if (outcome.status === "renewed") {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${outcome.token}`;
        return apiClient(original);
      }

      // ⚠️ Only "session-over" ends the session. "unavailable" means nothing was decided —
      // no signal, a timeout, a 409 because another request renewed a second ago, a 500 from
      // a server still starting — and the 401 simply surfaces, which the screen can retry.
      // Logging out on anything that was not a renewal is what signed patients out for a
      // server hiccup they never saw.
      //
      // Imported here rather than at the top so this module never depends on the store at load
      // time.
      if (outcome.status === "session-over") {
        const { useAuthStore } = await import("../store/useAuthStore");
        await useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
