/**
 * Keys under which the session lives in expo-secure-store.
 *
 * In their own module so that neither the API client nor the auth store has to import the
 * other for them. Both need the names; only one of them may own the behaviour.
 */
export const ACCESS_TOKEN_KEY = "userToken";

/** Buys a new access token. Single use: every renewal replaces it. */
export const REFRESH_TOKEN_KEY = "refreshToken";
