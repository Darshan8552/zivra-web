import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp.tsx";
import {
  getErrorMessage,
  useResendOtp,
  useVerifyEmail,
} from "#/lib/auth/auth.hooks.ts";
import { verifyEmailSchema } from "#/lib/auth/auth.validator.ts";

export const Route = createFileRoute("/_auth/verify-email/")({
  validateSearch: verifyEmailSchema.pick({ email: true }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { email } = Route.useSearch();
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const navigate = useNavigate();
  const verifyEmail = useVerifyEmail();
  const resendOtp = useResendOtp();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const resend = () => {
    if (secondsLeft > 0 || !email || resendOtp.isPending) return;
    resendOtp.mutate(
      { email, purpose: "REGISTER" },
      {
        onSuccess: () => {
          setSecondsLeft(60);
          toast("New code sent to your inbox");
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't resend the code.")),
      },
    );
  };

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (otp.length !== 6 || !email || verifyEmail.isPending) return;

    verifyEmail.mutate(
      { email, otp },
      {
        onSuccess: () => {
          toast.success("Email verified");
          navigate({ to: "/feed" });
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "That code didn't work.")),
      },
    );
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="overline text-muted-foreground mb-3 block">
            Verification code
          </label>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 sm:w-14 rounded-lg border border-border bg-secondary text-2xl font-display font-semibold data-[active=true]:border-accent data-[active=true]:ring-2 data-[active=true]:ring-accent/20"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="submit"
          disabled={otp.length !== 6 || verifyEmail.isPending}
          className="w-full py-3.5 rounded-full bg-foreground text-background font-display font-semibold text-base hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {verifyEmail.isPending ? "Verifying…" : "Verify email"}{" "}
          <ArrowRight size={16} strokeWidth={2} />
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={secondsLeft > 0 || resendOtp.isPending}
            className="text-muted-foreground hover:text-accent disabled:hover:text-muted-foreground transition-colors duration-200"
          >
            {secondsLeft > 0 ? (
              <>
                Resend in{" "}
                <span className="font-mono-alt text-foreground">
                  {String(secondsLeft).padStart(2, "0")}s
                </span>
              </>
            ) : (
              <span className="text-accent font-semibold">Resend code</span>
            )}
          </button>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 text-foreground font-semibold hover:text-accent transition-colors duration-200"
          >
            <Mail size={14} strokeWidth={1.75} /> Change email
          </Link>
        </div>
      </form>
    </>
  );
}
