import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ModeToggle } from "#/components/mode-toggle.tsx";
import type { ReactNode } from "react";
import { currentUserQueryOptions } from "#/lib/query.options.ts";

interface AuthRouteConfig {
  eyebrow: string;
  headline: ReactNode;
  sub: ReactNode;
  imageUrl: string;
  imagePosition: "left" | "right";
}

const AUTH_CONFIG: Record<string, AuthRouteConfig> = {
  signup: {
    eyebrow: "New here?",
    headline: (
      <>
        Make yourself
        <br />
        <span className="italic font-light">at home.</span>
      </>
    ),
    sub: "Three fields. Sixty seconds. No noise.",
    imageUrl:
      "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=1400",
    imagePosition: "left",
  },
  forgotPassword: {
    eyebrow: "Forgot it?",
    headline: (
      <>
        Happens to the <span className="italic font-light">best</span> of us.
      </>
    ),
    sub: "Type in the email you signed up with. We'll send you a reset link.",
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1400&auto=format",
    imagePosition: "right",
  },
  verifyEmail: {
    eyebrow: "One more step",
    headline: (
      <>
        Check your <span className="italic font-light">inbox.</span>
      </>
    ),
    sub: (
      <>
        We sent a six-digit code to{" "}
        <span className="text-foreground font-semibold">ava@pulse.co</span>.
        It'll expire in 10 minutes.
      </>
    ),
    imageUrl:
      "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=1400",
    imagePosition: "right",
  },
  signin: {
    eyebrow: "Welcome back",
    headline: (
      <>
        Good to see you
        <br />
        <span className="italic font-light">again.</span>
      </>
    ),
    sub: "Sign in to pick up right where you left off",
    imageUrl:
      "https://images.pexels.com/photos/31022528/pexels-photo-31022528.jpeg?w=1400",
    imagePosition: "right",
  },
};

function getRouteConfig(pathname: string): AuthRouteConfig {
  if (pathname.includes("/signup")) return AUTH_CONFIG.signup;
  if (
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")
  ) {
    return AUTH_CONFIG.forgotPassword;
  }
  if (pathname.includes("/verify-email") || pathname.includes("/verify")) {
    return AUTH_CONFIG.verifyEmail;
  }
  return AUTH_CONFIG.signin;
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions,
    );
    if (user) {
      throw redirect({ to: "/feed" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const location = useLocation();
  const config = getRouteConfig(location.pathname);

  const formSide = (
    <div className="flex flex-col w-full min-h-screen lg:min-h-0 lg:h-screen px-6 sm:px-10 lg:px-16 py-8 justify-between bg-background">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Sparkles
              size={18}
              strokeWidth={2}
              className="text-accent-foreground"
            />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            Zivra<span className="text-accent">.</span>
          </span>
        </Link>
        <ModeToggle />
      </div>

      <div className="w-full max-w-md mx-auto py-12">
        {config.eyebrow && (
          <p className="overline text-accent mb-4">{config.eyebrow}</p>
        )}
        {config.headline && (
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-3">
            {config.headline}
          </h1>
        )}
        {config.sub && (
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            {config.sub}
          </p>
        )}

        {/* Render child form components (/signin, /signup, /forgot-password, /verify-email) */}
        <Outlet />
      </div>

      <p className="text-xs text-muted-foreground">
        © 2026 Pulse. Made for people who make things.
      </p>
    </div>
  );

  const imageSide = (
    <div className="hidden lg:block relative h-screen overflow-hidden bg-secondary">
      <img
        src={config.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute bottom-10 left-10 right-10 text-white">
        <p className="overline mb-3 text-white/70">Editorial · Volume 07</p>
        <p className="font-display text-3xl font-semibold tracking-tight leading-tight">
          "The best conversations happen
          <br />
          in the quiet corners of the internet."
        </p>
        <p className="mt-4 text-white/70 text-sm">
          — Ava Reyes, editor at large
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {config.imagePosition === "left" ? (
        <>
          {imageSide}
          {formSide}
        </>
      ) : (
        <>
          {formSide}
          {imageSide}
        </>
      )}
    </div>
  );
}
