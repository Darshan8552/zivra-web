import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ComponentProps, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, useForgotPassword } from "#/lib/auth/auth.hooks.ts";

export const Route = createFileRoute("/_auth/forgot-password/")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();

  const submit: ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();
    if (forgotPassword.isPending) return;

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          setSent(true);
          toast("Code sent, if that account exists");
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't send the code.")),
      },
    );
  };

  return (
    <>
      {sent ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
            <p className="font-display font-semibold text-lg tracking-tight">
              Sent — check your inbox.
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              If {email} is registered with us, a 6-digit code will land there
              in a moment. It expires in 10 minutes.
            </p>
          </div>
          <button
            onClick={() =>
              navigate({ to: "/reset-password", search: { email } })
            }
            className="w-full py-3.5 rounded-full bg-foreground text-background font-display font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Enter code <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate({ to: "/signin" })}
            className="w-full py-3.5 rounded-full border border-border font-display font-semibold hover:border-foreground transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} strokeWidth={2} /> Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="overline text-muted-foreground mb-2 block">
              Your email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.good"
              className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={forgotPassword.isPending}
            className="w-full py-3.5 rounded-full bg-foreground text-background font-display font-semibold hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {forgotPassword.isPending ? "Sending…" : "Send code"}{" "}
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              to="/signin"
              className="text-foreground font-semibold hover:text-accent transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </>
  );
}
