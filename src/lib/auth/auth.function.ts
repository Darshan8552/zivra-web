import { createServerFn } from "@tanstack/react-start";
import {
  forgotPasswordSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signInSchema,
  signupSchema,
  verifyEmailSchema,
} from "#/lib/auth/auth.validator.ts";
import {
  BackendApiError,
  backendRequest,
} from "#/lib/config/backend-client.ts";
import type { AuthTokens, AuthUser } from "#/lib/auth/auth.types.ts";
import {
  clearAuthCookies,
  getValidAccessToken,
  setAuthCookies,
} from "#/lib/config/session.server.ts";
import { getCookie } from "@tanstack/react-start/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "#/lib/config/config.ts";

export const signupFn = createServerFn({ method: "POST" })
  .validator(signupSchema)
  .handler(async ({ data }) => {
    return await backendRequest<{ message: string }>("/auth/signup", {
      method: "POST",
      body: data,
    });
  });

export const verifyEmailFn = createServerFn({ method: "POST" })
  .validator(verifyEmailSchema)
  .handler(async ({ data }) => {
    const result = await backendRequest<{ user: AuthUser } & AuthTokens>(
      "/auth/verify-email",
      {
        method: "POST",
        body: data,
      },
    );
    setAuthCookies(result);
    return { user: result.user };
  });

export const resendOtpFn = createServerFn({ method: "POST" })
  .validator(resendOtpSchema)
  .handler(async ({ data }) => {
    return backendRequest<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: data,
    });
  });

export const signinFn = createServerFn({ method: "POST" })
  .validator(signInSchema)
  .handler(async ({ data }) => {
    const result = await backendRequest<{ user: AuthUser } & AuthTokens>(
      "/auth/signin",
      {
        method: "POST",
        body: data,
      },
    );
    setAuthCookies(result);
    return { user: result.user };
  });

export const forgotPasswordFn = createServerFn({ method: "POST" })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    return backendRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: data,
    });
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { resetToken } = await backendRequest<{ resetToken: string }>(
      "/auth/verify-reset-otp",
      {
        method: "POST",
        body: { email: data.email, otp: data.otp },
      },
    );

    return backendRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { resetToken, newPassword: data.newPassword },
    });
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      const accessToken =
        getCookie(ACCESS_TOKEN_COOKIE) ??
        getCookie("access_token") ??
        getCookie("__Host-access_token") ??
        null;
      const refreshToken =
        getCookie(REFRESH_TOKEN_COOKIE) ??
        getCookie("refresh_token") ??
        getCookie("__Host-refresh_token") ??
        null;
      const token = accessToken ?? refreshToken;
      if (token) {
        await backendRequest("/auth/logout", {
          method: "POST",
          bearerToken: token,
        }).catch(() => {
          // ignore backend logout errors — still clear local cookies
        });
      }
    } finally {
      clearAuthCookies();
    }
    return { success: true };
  },
);

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser | null> => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return null;

    try {
      return await backendRequest<AuthUser>("/auth/me", {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        return null;
      }
      throw error;
    }
  },
);
