import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { getErrorMessage, useSignUp } from "#/lib/auth/auth.hooks.ts";
import { signupSchema } from "#/lib/auth/auth.validator.ts";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/signup/")({
  component: Signup,
});

function Signup() {
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const signUp = useSignUp();

  const signupValidation = useMemo(
    () =>
      signupSchema.safeParse({
        name,
        email,
        dateOfBirth,
        password,
      }),
    [dateOfBirth, email, name, password],
  );

  const canSubmit = agreed && signupValidation.success && !signUp.isPending;

  const submit: ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();

    if (!agreed || signUp.isPending) return;

    if (!signupValidation.success) {
      toast.error(
        signupValidation.error.issues[0]?.message ??
          "Please complete the form correctly.",
      );
      return;
    }

    signUp.mutate(signupValidation.data, {
      onSuccess: () => {
        toast.success("Account created — check your inbox for a code.");
        navigate({ to: "/verify-email", search: { email } });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't create your account."));
      },
    });
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        <Field label="name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ava Reyes"
            className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.good"
            className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-12 px-4 pr-12 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
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

        <label
          onClick={() => setAgreed((v) => !v)}
          className="flex items-start gap-3 text-sm cursor-pointer select-none"
        >
          <span
            className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors duration-200 ${agreed ? "bg-accent border-accent" : "border-border bg-secondary"}`}
          >
            {agreed && (
              <Check
                size={14}
                strokeWidth={2.5}
                className="text-accent-foreground"
              />
            )}
          </span>
          <span className="text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <a
              href="#"
              className="text-foreground font-semibold hover:text-accent"
            >
              Terms
            </a>{" "}
            and the{" "}
            <a
              href="#"
              className="text-foreground font-semibold hover:text-accent"
            >
              Privacy Policy
            </a>
            . I know this is a slower internet.
          </span>
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-full bg-foreground text-background font-display font-semibold text-base hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {signUp.isPending ? "Creating account…" : "Create account"}{" "}
          <ArrowRight size={16} strokeWidth={2} />
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already on Zivra?{" "}
          <Link
            to="/signin"
            className="text-foreground font-semibold hover:text-accent transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="overline text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);
