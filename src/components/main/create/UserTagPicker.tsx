import { Avatar } from "#/components/ui/avatar.tsx";
import type { UserSuggestion } from "#/lib/posts/posts.types.ts";
import { useId, useState } from "react";
import { useUserTagSuggestions } from "#/lib/posts/posts.hooks.ts";
import { X } from "lucide-react";

const MAX_TAGGED_USERS = 20;

export function UserTagPicker({
  value,
  onChange,
}: {
  value: UserSuggestion[];
  onChange: (next: UserSuggestion[]) => void;
}) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: suggestions, isFetching } = useUserTagSuggestions(query);
  const selectedIds = new Set(value.map((u) => u.id));
  const visibleSuggestions = (suggestions ?? []).filter(
    (s) => !selectedIds.has(s.id),
  );

  const addUser = (user: UserSuggestion) => {
    if (selectedIds.has(user.id) || value.length >= MAX_TAGGED_USERS) return;
    onChange([...value, user]);
    setQuery("");
  };

  const removeUser = (id: string) => {
    onChange(value.filter((u) => u.id !== id));
  };
  return (
    <div>
      <label htmlFor={inputId} className="overline text-muted-foreground">
        Tag users
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border px-3 py-2 focus-within:border-foreground transition-colors duration-200">
        {value.map((user) => (
          <span
            key={user.id}
            data-testid={`create-tagged-user-chip-${user.username}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold pl-1.5 pr-2 h-7 rounded-full bg-accent/10 text-accent"
          >
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              username={user.username}
              size="xs"
              shape="circle"
            />
            @{user.username}
            <button
              type="button"
              aria-label={`Remove @${user.username}`}
              onClick={() => removeUser(user.id)}
              className="hover:opacity-70 transition-opacity duration-150"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          data-testid="create-tagged-users-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={value.length === 0 ? "Search people..." : ""}
          className="flex-1 min-w-[8ch] h-7 bg-transparent text-sm focus:outline-none"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Search by name or username.
      </p>

      {open && query.trim().length > 0 && (
        <div
          data-testid="create-user-suggestions"
          className="mt-2 rounded-2xl border border-border bg-background shadow-sm overflow-hidden divide-y divide-border"
        >
          {visibleSuggestions.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              {isFetching ? "Searching..." : "No matching people"}
            </p>
          ) : (
            visibleSuggestions.map((s) => (
              <button
                type="button"
                key={s.id}
                data-testid={`create-user-suggestion-${s.username}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addUser(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors duration-150"
              >
                <Avatar
                  src={s.avatarUrl}
                  name={s.name}
                  username={s.username}
                  size="sm"
                  shape="square"
                />
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm tracking-tight truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{s.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
