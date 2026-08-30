import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Home,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { ModeToggle } from "#/components/mode-toggle.tsx";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, useSignOut } from "#/lib/auth/auth.hooks.ts";
import { toast } from "sonner";
import { useUnreadNotificationCount } from "#/lib/notifications/notifications.hooks.ts";

function NotificationBadge({
  className = "",
  dot = false,
}: {
  className?: string;
  dot?: boolean;
}) {
  const { data } = useUnreadNotificationCount();
  const count = data?.count ?? 0;
  if (count <= 0) return null;
  if (dot) {
    return (
      <span
        className={`block rounded-full bg-accent ring-2 ring-background ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const links = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  { to: "/chat", label: "Messages", icon: MessageCircle },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/profile", label: "Profile", icon: User },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { data: user } = useQuery(currentUserQueryOptions);
  const signOut = useSignOut();

  const handleSignOut = () => {
    if (signOut.isPending) return;
    signOut.mutate(undefined, {
      onSuccess: () => navigate({ to: "/" }),
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't sign you out.")),
    });
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col justify-between border-r border-border bg-background px-8 py-10 z-30">
      <div>
        <div className="flex items-center gap-2 mb-16">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Sparkles
              size={18}
              strokeWidth={2}
              className="text-accent-foreground"
            />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            zivra<span className="text-accent">.</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 py-3 pl-2 pr-4 rounded-lg font-display text-lg tracking-tight transition-[color,transform,background-color] duration-200"
              activeProps={{
                className: "text-accent translate-x-1",
              }}
              inactiveProps={{
                className:
                  "text-foreground hover:text-accent hover:translate-x-1",
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={1.75} />
                  <span>{label}</span>
                  {to === "/notifications" && (
                    <NotificationBadge className="ml-2" />
                  )}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <Link to="/settings" search={{ tab: "privacy" }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200" activeProps={{ className: "flex items-center gap-2 text-sm text-accent" }}>
            <Settings size={16} strokeWidth={1.75} /> Settings
          </Link>
          <ModeToggle />
        </div>
        <button
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-200 disabled:opacity-60"
        >
          <LogOut size={16} strokeWidth={1.75} />{" "}
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <img
            src={
              user?.avatarUrl ??
              "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=200&auto=format"
            }
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm tracking-tight truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const BottomNav = () => {
  return (
    <nav
      aria-label="Bottom navigation"
      className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex justify-center"
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-surface/85 backdrop-blur-xl px-2 py-2 shadow-lg">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="relative h-11 w-11 flex items-center justify-center rounded-full transition-colors duration-200"
            activeProps={{
              className: "bg-foreground text-background",
            }}
            inactiveProps={{
              className: "text-muted-foreground hover:text-foreground",
            }}
          >
            <Icon size={20} strokeWidth={1.75} />
            {to === "/notifications" && (
              <NotificationBadge className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5" dot />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};
