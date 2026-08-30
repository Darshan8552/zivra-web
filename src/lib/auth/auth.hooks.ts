import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forgotPasswordFn,
  resendOtpFn,
  resetPasswordFn,
  signinFn,
  signOutFn,
  signupFn,
  verifyEmailFn,
} from "#/lib/auth/auth.function.ts";
import type {
  ForgotPasswordType,
  ResendOtpType,
  ResetPasswordType,
  SignInType,
  SignUpType,
  VerifyEmailType,
} from "#/lib/auth/auth.validator.ts";
import { currentUserQueryOptions } from "#/lib/query.options.ts";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export function useSignUp() {
  return useMutation({
    mutationFn: async (data: SignUpType) => await signupFn({ data }),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyEmailType) => await verifyEmailFn({ data }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(currentUserQueryOptions.queryKey, user);
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (data: ResendOtpType) => resendOtpFn({ data }),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SignInType) => signinFn({ data }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(currentUserQueryOptions.queryKey, user);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordType) => forgotPasswordFn({ data }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordType) => resetPasswordFn({ data }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => signOutFn(),
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryOptions.queryKey, null);
      queryClient.clear();
    },
  });
}
