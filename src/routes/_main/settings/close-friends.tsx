import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Search, Shield, UserPlus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "#/components/ui/avatar.tsx";
import {
  useAddCloseFriend,
  useCloseFriends,
  useRemoveCloseFriend,
} from "#/lib/close-friends/close-friends.hooks.ts";
import { useSuggestions } from "#/lib/users/users.hooks.ts";

export const Route = createFileRoute("/_main/settings/close-friends")({
  component: CloseFriendsPage,
});

function CloseFriendsPage() {
  const { data: closeFriends, isLoading: isLoadingFriends, isError: isErrorFriends, refetch } = useCloseFriends();
  const { data: suggestions, isLoading: isLoadingSuggestions } = useSuggestions();
  const addMutation = useAddCloseFriend();
  const removeMutation = useRemoveCloseFriend();
  const [query, setQuery] = useState("");

  const list = closeFriends ?? [];
  const count = list.length;
  const isFull = count >= 50;

  const existingUsernames = useMemo(() => new Set(list.map((cf) => cf.friend.username.toLowerCase())), [list]);
  const existingIds = useMemo(() => new Set(list.map((cf) => cf.friendId)), [list]);

  const filteredSuggestions = useMemo(() => {
    const all = suggestions ?? [];
    const q = query.trim().toLowerCase();
    return all
      .filter((u) => !existingUsernames.has(u.username.toLowerCase()) && !existingIds.has(u.id))
      .filter((u) => {
        if (!q) return true;
        return (
          u.username.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [suggestions, existingUsernames, existingIds, query]);

  const handleAdd = (username: string) => {
    if (isFull) {
      toast.error("Close friends limit reached (max 50)");
      return;
    }
    addMutation.mutate(username);
  };

  const handleRemove = (friendId: string) => {
    removeMutation.mutate(friendId);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/settings"
          search={{ tab: "close" } as never}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          data-testid="close-friends-back"
        >
          <ArrowLeft size={14} /> Back to Settings
        </Link>

        <header className="border-b border-border pb-6 mb-8">
          <p className="overline text-accent">Close Friends</p>
          <h1 className="font-display font-bold text-4xl tracking-tight mt-2">Close Friends</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Share stories only with Close Friends when you want more privacy. Only you can see this list.
          </p>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5" data-testid="close-friends-count">
            <Users size={12} /> {count} / 50
          </p>
        </header>

        {/* Add section */}
        <section className="rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-display font-semibold text-lg tracking-tight flex items-center gap-2">
            <UserPlus size={16} /> Add close friends
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Search from suggestions or type a username.</p>

          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username"
              aria-label="Search users"
              data-testid="close-friends-search"
              className="w-full h-11 pl-9 pr-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {isLoadingSuggestions ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading suggestions…
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4 text-center py-4 border border-dashed border-border rounded-2xl">
              No suggestions{query ? ` for "${query}"` : ""}. Try a different search.
            </p>
          ) : (
            <ul className="mt-4 space-y-2" aria-label="Suggestions">
              {filteredSuggestions.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  data-testid={`suggestion-${u.username}`}
                >
                  <Avatar src={u.avatarUrl} name={u.name} username={u.username} size="sm" shape="circle" className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(u.username)}
                    disabled={addMutation.isPending || isFull}
                    data-testid={`add-${u.username}`}
                    className="px-4 h-9 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 shrink-0"
                  >
                    {addMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isFull && (
            <p className="text-xs text-destructive mt-3" data-testid="close-friends-full-warning">
              You have reached the maximum of 50 close friends. Remove someone to add more.
            </p>
          )}
        </section>

        {/* List section */}
        <section className="rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
              <Users size={16} />
            </span>
            <h2 className="font-display font-semibold text-lg tracking-tight">Your Close Friends</h2>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
              {count} / 50
            </span>
          </div>

          {isLoadingFriends ? (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <p className="text-sm">Loading close friends…</p>
            </div>
          ) : isErrorFriends ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Failed to load close friends</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 px-4 h-9 rounded-full border border-border text-sm font-semibold hover:border-foreground transition-colors"
              >
                Retry
              </button>
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Users size={20} />
              </span>
              <p className="overline text-muted-foreground mt-4">No close friends</p>
              <p className="font-display text-2xl tracking-tight mt-2">Add people to Close Friends</p>
              <p className="text-sm text-muted-foreground mt-2">They will be able to see your Close Friends stories.</p>
              <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
                <Shield size={12} /> Only you can see your Close Friends list
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border" aria-label="Close friends list">
              {list.map((cf) => (
                <li
                  key={cf.id}
                  className="flex items-center gap-3 py-3"
                  data-testid={`close-friend-${cf.friend.username}`}
                >
                  <Avatar
                    src={cf.friend.avatarUrl}
                    name={cf.friend.name}
                    username={cf.friend.username}
                    size="md"
                    shape="circle"
                    className="h-10 w-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{cf.friend.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{cf.friend.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(cf.friendId)}
                    disabled={removeMutation.isPending}
                    aria-label={`Remove ${cf.friend.username}`}
                    data-testid={`remove-${cf.friend.username}`}
                    className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    {removeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <Shield size={12} /> Only you can see your Close Friends list
          </p>
        </section>
      </div>
    </div>
  );
}
