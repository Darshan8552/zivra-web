import { z } from "zod";
import { PURPOSES } from "#/lib/auth/auth.types.ts";

export const signupSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.email().toLowerCase().trim(),
  dateOfBirth: z.string().min(3).max(255),
  password: z.string().min(3).max(255),
});

export type SignUpType = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().min(6).max(6),
});

export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;

export const resendOtpSchema = z.object({
  email: z.email(),
  purpose: z.enum(PURPOSES),
});

export type ResendOtpType = z.infer<typeof resendOtpSchema>;

export const signInSchema = z.object({
  identifier: z.string().min(3).max(255),
  password: z.string().min(3).max(255),
});

export type SignInType = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().min(6).max(6),
  newPassword: z.string().min(3).max(255),
});

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
