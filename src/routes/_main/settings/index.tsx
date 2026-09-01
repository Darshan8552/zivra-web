import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Ban,
  Heart,
  Lock,
  LogOut,
  Play,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { z } from "zod";
import { Stories } from "#/components/Stories.tsx";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import { useTogglePrivate } from "#/lib/users/users.hooks.ts";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/settings/")({
  validateSearch: z.object({
    tab: z
      .enum(["privacy", "blocked", "account", "liked", "stories", "close"])
      .optional()
      .default("privacy"),
  }),
  component: SettingsPage,
});

const tabs = [
  { id: "privacy", label: "Private" },
  { id: "blocked", label: "Blocked" },
  { id: "account", label: "Account" },
  { id: "liked", label: "Liked" },
  { id: "stories", label: "Stories" },
  { id: "close", label: "Close Friends" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SettingsPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: me } = useQuery(currentUserQueryOptions);
  const togglePrivate = useTogglePrivate();

  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  const active = tab as TabId;

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const ids = tabs.map((t) => t.id);
    const idx = ids.indexOf(active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = ids[(idx + 1) % ids.length];
      navigate({ search: { tab: next as TabId } } as never);
      document.getElementById(`tab-${slug(next)}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = ids[(idx - 1 + ids.length) % ids.length];
      navigate({ search: { tab: prev as TabId } } as never);
      document.getElementById(`tab-${slug(prev)}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      navigate({ search: { tab: ids[0] as TabId } } as never);
      document.getElementById(`tab-${slug(ids[0])}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      navigate({ search: { tab: ids[ids.length - 1] as TabId } } as never);
      document.getElementById(`tab-${slug(ids[ids.length - 1])}`)?.focus();
    }
  };

  const comingSoon = () => toast.info("Coming soon");

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="border-b border-border pb-6 mb-8">
          <p className="overline text-accent">Settings</p>
          <h1 className="font-display font-bold text-4xl tracking-tight mt-2">Settings</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">Manage your account, privacy and content. Features below are placeholders — we will wire them one by one.</p>
        </header>

        <div
          role="tablist"
          aria-label="Settings"
          aria-orientation="horizontal"
          onKeyDown={onTabKeyDown}
          className="flex gap-2 overflow-x-auto no-scrollbar border-b border-border mb-8"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${slug(t.id)}`}
              aria-controls={`panel-${slug(t.id)}`}
              aria-selected={active === t.id}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => navigate({ search: { tab: t.id as TabId } } as never)}
              data-testid={`settings-tab-${t.id}`}
              className={`relative px-4 py-3 text-sm font-display font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${active === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
              {active === t.id && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>

        <section role="tabpanel" id={`panel-${slug(active)}`} aria-labelledby={`tab-${slug(active)}`}>
          {active === "privacy" && (
            <div className="rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center"><Lock size={16} /></span>
                <h2 className="font-display font-semibold text-lg tracking-tight">Private account</h2>
                {togglePrivate.isPending && <span className="ml-auto text-xs text-muted-foreground">Saving…</span>}
              </div>
              <p className="text-sm text-muted-foreground">When private, only followers you approve can see your posts. Your existing followers keep access.</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                <div>
                  <p className="text-sm font-medium">Private account</p>
                  <p className="text-xs text-muted-foreground">@{me?.username ?? "you"} · {me?.isPrivate ? "Private" : "Public"}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!me?.isPrivate}
                  aria-label="Toggle private account"
                  disabled={togglePrivate.isPending}
                  onClick={() => {
                    const next = !me?.isPrivate;
                    togglePrivate.mutate(next);
                  }}
                  data-testid="settings-private-toggle"
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 disabled:opacity-60 ${me?.isPrivate ? "bg-accent" : "bg-secondary"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-background shadow transition-transform duration-200 ${me?.isPrivate ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          )}

          {active === "blocked" && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center py-16">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><Ban size={20} /></span>
              <p className="overline text-muted-foreground mt-4">No blocked users</p>
              <p className="font-display text-2xl tracking-tight mt-2">You have not blocked anyone</p>
              <p className="text-sm text-muted-foreground mt-2">Blocked users will appear here. You can block from their profile.</p>
              <button type="button" onClick={comingSoon} data-testid="settings-blocked-add" className="mt-6 px-5 h-11 rounded-full bg-foreground text-background font-semibold text-sm">Manage blocked users</button>
            </div>
          )}

          {active === "account" && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center"><Trash2 size={16} /></span>
                <h2 className="font-display font-semibold text-lg tracking-tight">Delete account</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Permanently delete your account and all posts, likes and stories. This cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/profile/edit" className="px-5 h-11 rounded-full border border-border font-semibold text-sm flex items-center hover:border-foreground transition-colors">Edit profile</Link>
                <button type="button" onClick={comingSoon} data-testid="settings-delete-btn" className="px-5 h-11 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm inline-flex items-center gap-1.5"><LogOut size={14} /> Delete account</button>
              </div>
            </div>
          )}

          {active === "liked" && (
            <div className="rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center"><Heart size={16} /></span>
                <h2 className="font-display font-semibold text-lg tracking-tight">Liked posts</h2>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Coming soon</span>
              </div>
              <div className="py-16 text-center border border-dashed border-border rounded-2xl">
                <Heart size={20} className="mx-auto text-muted-foreground" />
                <p className="font-display text-lg tracking-tight mt-3">No liked posts yet</p>
                <p className="text-sm text-muted-foreground">Posts you like will appear here.</p>
                <Link to="/feed" className="mt-4 inline-flex px-5 h-11 rounded-full bg-accent text-accent-foreground font-semibold text-sm items-center">Explore feed</Link>
              </div>
            </div>
          )}

          {active === "stories" && (
            <div className="rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center"><Play size={16} /></span>
                <h2 className="font-display font-semibold text-lg tracking-tight">Stories</h2>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Preview</span>
              </div>
              <Stories />
              <div className="mt-6 flex gap-3">
                <Link to="/settings/close-friends" data-testid="settings-manage-close-friends" className="px-5 h-11 rounded-full bg-foreground text-background font-semibold text-sm inline-flex items-center">Manage Close Friends</Link>
                <button type="button" onClick={comingSoon} className="px-5 h-11 rounded-full border border-border font-semibold text-sm">Story settings</button>
              </div>
            </div>
          )}

          {active === "close" && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center py-16">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><Users size={20} /></span>
              <p className="overline text-muted-foreground mt-4">Close Friends</p>
              <p className="font-display text-2xl tracking-tight mt-2">Add people to Close Friends</p>
              <p className="text-sm text-muted-foreground mt-2">Share stories only with Close Friends when you want more privacy.</p>
              <Link to="/settings/close-friends" data-testid="settings-close-add" className="mt-6 inline-flex items-center gap-1.5 px-5 h-11 rounded-full bg-accent text-accent-foreground font-semibold text-sm"><UserPlus size={14} /> Manage Close Friends</Link>
              <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5"><Shield size={12} /> Only you can see your Close Friends list</p>
            </div>
          )}
        </section>

        <p className="text-xs text-muted-foreground mt-8 text-center">More settings will be added one by one. Current page is UI only.</p>
      </div>
    </div>
  );
}
