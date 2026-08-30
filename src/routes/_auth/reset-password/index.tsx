import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ComponentProps, type ReactNode, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp.tsx";
import { getErrorMessage, useResetPassword } from "#/lib/auth/auth.hooks.ts";
import { resetPasswordSchema } from "#/lib/auth/auth.validator.ts";

export const Route = createFileRoute("/_auth/reset-password/")({
  validateSearch: resetPasswordSchema.pick({ email: true }),
  component: ResetPassword,
});

function ResetPassword() {
  const { email: emailFromSearch } = Route.useSearch();
  const [email, setEmail] = useState(emailFromSearch ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    email.length > 0 &&
    otp.length === 6 &&
    passwordsMatch &&
    !resetPassword.isPending;

  const submit: ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    resetPassword.mutate(
      { email, otp, newPassword },
      {
        onSuccess: () => {
          toast.success("Password reset — sign in with your new password.");
          navigate({ to: "/signin" });
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't reset your password.")),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {!emailFromSearch && (
        <Field label="Email">
          <input
            data-testid="reset-email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.good"
            className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
          />
        </Field>
      )}

      <div>
        <label className="overline text-muted-foreground mb-3 block">
          Verification code
        </label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          data-testid="reset-otp-input"
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                data-testid={`reset-otp-slot-${i}`}
                className="h-14 w-12 sm:w-14 rounded-lg border border-border bg-secondary text-2xl font-display font-semibold data-[active=true]:border-accent data-[active=true]:ring-2 data-[active=true]:ring-accent/20"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Field label="New password">
        <div className="relative">
          <input
            data-testid="reset-new-password-input"
            type={showPwd ? "text" : "password"}
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full h-12 px-4 pr-12 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            data-testid="reset-password-toggle"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPwd ? (
              <EyeOff size={16} strokeWidth={1.75} />
            ) : (
              <Eye size={16} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </Field>

      <Field label="Confirm new password">
        <input
          data-testid="reset-confirm-password-input"
          type={showPwd ? "text" : "password"}
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Type it again"
          className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-destructive mt-2">
            Passwords don't match.
          </p>
        )}
      </Field>

      <button
        data-testid="reset-submit-btn"
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-full bg-foreground text-background font-display font-semibold text-base hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {resetPassword.isPending ? "Resetting…" : "Reset password"}{" "}
        <ArrowRight size={16} strokeWidth={2} />
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          to="/signin"
          data-testid="reset-signin-link"
          className="text-foreground font-semibold hover:text-accent transition-colors duration-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="overline text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);
