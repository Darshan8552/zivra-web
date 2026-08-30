import { useId, useRef, useState } from "react";
import { Hash, X } from "lucide-react";
import { useHashtagSuggestions } from "#/lib/posts/posts.hooks.ts";

const MAX_HASHTAGS = 30;

function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9_]/g, "");
}

export function HashtagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: suggestions, isFetching } = useHashtagSuggestions(query);
  const visibleSuggestions = (suggestions ?? []).filter(
    (s) => !value.includes(s.name),
  );

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || value.includes(tag) || value.length >= MAX_HASHTAGS) return;
    onChange([...value, tag]);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (query.trim()) addTag(query);
    } else if (e.key === "Backspace" && !query && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="overline text-muted-foreground">
        Hashtags
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border px-3 py-2 focus-within:border-foreground transition-colors duration-200">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 text-xs font-semibold pl-3 pr-2 h-7 rounded-full bg-secondary text-foreground/80"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Remove #${tag}`}
              onClick={() => removeTag(tag)}
              className="hover:text-accent transition-colors duration-150"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          data-testid="create-hashtags-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "travel, sunset..." : ""}
          className="flex-1 min-w-[8ch] h-7 bg-transparent text-sm focus:outline-none"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Type to search, press Enter to add.
      </p>
      {open && (query.trim().length > 0 || isFetching) && (
        <div className="mt-2 rounded-2xl border border-border bg-background shadow-sm overflow-hidden divide-y divide-border">
          {visibleSuggestions.length === 0 ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(query)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors duration-150"
            >
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Hash size={14} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm tracking-tight truncate">
                  #{normalizeTag(query) || query}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  New tag
                </p>
              </div>
            </button>
          ) : (
            visibleSuggestions.map((s) => (
              <button
                type="button"
                key={s.id}
                data-testid={`create-hashtag-suggestion-${s.name}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(s.name)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors duration-150"
              >
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Hash size={14} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm tracking-tight truncate">
                    #{s.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.postCount} {s.postCount === 1 ? "post" : "posts"}
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
