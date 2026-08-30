import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";
import type { AuthTokens } from "#/lib/auth/auth.types.ts";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "#/lib/config/config.ts";
import {
  backendRequest,
  BackendApiError,
} from "#/lib/config/backend-client.ts";

export function setAuthCookies(tokens: AuthTokens): void {
  setCookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS),
  );
  setCookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function clearAuthCookies(): void {
  const baseOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  };
  const names = [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    "access_token",
    "__Host-access_token",
    "refresh_token",
    "__Host-refresh_token",
  ];

  for (const name of [...new Set(names)]) {
    deleteCookie(name, { ...baseOpts, secure: true });
    deleteCookie(name, { ...baseOpts, secure: false });
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const accessToken =
    getCookie(ACCESS_TOKEN_COOKIE) ??
    getCookie("access_token") ??
    getCookie("__Host-access_token");
  if (accessToken) return accessToken;

  const refreshToken =
    getCookie(REFRESH_TOKEN_COOKIE) ??
    getCookie("refresh_token") ??
    getCookie("__Host-refresh_token");
  if (!refreshToken) return null;

  try {
    const tokens = await backendRequest<AuthTokens>("/auth/refresh", {
      method: "POST",
      bearerToken: refreshToken,
    });
    setAuthCookies(tokens);
    return tokens.accessToken;
  } catch (error) {
    if (error instanceof BackendApiError) {
      clearAuthCookies();
      return null;
    }
    throw error;
  }
}
