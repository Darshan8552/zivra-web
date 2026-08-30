export function getBackendUrl() {
  const url = process.env.BACKEND_URL;
  if (!url) throw new Error("BACKEND_URL is not set. Add it to your .env");
  return url.replace(/\/+$/, "");
}

export const ACCESS_TOKEN_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-access_token"
    : "access_token";
export const REFRESH_TOKEN_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-refresh_token"
    : "refresh_token";

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
