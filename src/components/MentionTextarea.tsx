import {useMemo, useRef, useState} from "react";
import {AtSign, Hash} from "lucide-react";
import {currentUser, mentionableUsers, trendingTopics} from "#/lib/mock.ts";

type TriggerType = "@" | "#" | null;
type Suggestion = { key: string; value: string; label: string; sub: string; avatar?: string };

const TRIGGER_RE = /(^|\s)([@#])([\w.]*)$/;

export const MentionTextarea = ({
                                    value,
                                    onChange,
                                    placeholder,
                                    rows = 4,
                                    id,
                                    testId,
                                }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    id?: string;
    testId?: string;
}) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [trigger, setTrigger] = useState<TriggerType>(null);
    const [query, setQuery] = useState("");
    const [triggerStart, setTriggerStart] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const others = useMemo(
        () => mentionableUsers.filter((u) => u.username !== currentUser.username),
        [],
    );

    const suggestions: Suggestion[] = useMemo(() => {
        const q = query.toLowerCase();
        if (trigger === "@") {
            return others
                .filter((u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
                .slice(0, 6)
                .map((u) => ({
                    key: u.username,
                    value: u.username,
                    label: u.name,
                    sub: `@${u.username}`,
                    avatar: u.avatar
                }));
        }
        if (trigger === "#") {
            const matches = trendingTopics
                .filter((t) => t.tag.toLowerCase().includes(q))
                .slice(0, 6)
                .map((t) => ({key: t.tag, value: t.tag, label: `#${t.tag}`, sub: `${t.posts} posts`}));
            if (query && !matches.some((m) => m.value.toLowerCase() === q)) {
                matches.unshift({key: `custom-${query}`, value: query, label: `#${query}`, sub: "New tag"});
            }
            return matches;
        }
        return [];
    }, [trigger, query, others]);

    const detectTrigger = (text: string, cursor: number) => {
        const before = text.slice(0, cursor);
        const match = before.match(TRIGGER_RE);
        if (match) {
            setTrigger(match[2] as TriggerType);
            setQuery(match[3]);
            setTriggerStart(match.index! + match[1].length);
            setActiveIndex(0);
        } else {
            setTrigger(null);
            setQuery("");
            setTriggerStart(null);
        }
    };

    const closeSuggestions = () => {
        setTrigger(null);
        setQuery("");
        setTriggerStart(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        detectTrigger(e.target.value, e.target.selectionStart ?? e.target.value.length);
    };

    const applySuggestion = (val: string) => {
        if (triggerStart === null || !trigger || !ref.current) return;
        const el = ref.current;
        const cursor = el.selectionStart ?? value.length;
        const before = value.slice(0, triggerStart);
        const after = value.slice(cursor);
        const inserted = `${trigger}${val} `;
        const next = `${before}${inserted}${after}`;
        onChange(next);
        closeSuggestions();
        requestAnimationFrame(() => {
            const pos = before.length + inserted.length;
            el.focus();
            el.setSelectionRange(pos, pos);
        });
    };

    const insertTrigger = (char: "@" | "#") => {
        const el = ref.current;
        if (!el) return;
        const cursor = el.selectionStart ?? value.length;
        const needsSpace = cursor > 0 && !/\s/.test(value[cursor - 1] ?? " ");
        const insertion = `${needsSpace ? " " : ""}${char}`;
        const next = value.slice(0, cursor) + insertion + value.slice(cursor);
        onChange(next);
        requestAnimationFrame(() => {
            const pos = cursor + insertion.length;
            el.focus();
            el.setSelectionRange(pos, pos);
            detectTrigger(next, pos);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!trigger || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            applySuggestion(suggestions[activeIndex].value);
        } else if (e.key === "Escape") {
            closeSuggestions();
        }
    };

    return (
        <div>
            <textarea
                id={id}
                ref={ref}
                data-testid={testId}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => detectTrigger(value, (e.target as HTMLTextAreaElement).selectionStart ?? 0)}
                onBlur={() => setTimeout(closeSuggestions, 120)}
                placeholder={placeholder}
                rows={rows}
                className="w-full rounded-2xl border border-border bg-transparent p-4 text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
            />

            {trigger && suggestions.length > 0 && (
                <div
                    data-testid="composer-suggestions"
                    className="mt-2 rounded-2xl border border-border bg-background shadow-sm overflow-hidden divide-y divide-border"
                >
                    {suggestions.map((s, i) => (
                        <button
                            type="button"
                            key={s.key}
                            data-testid={`composer-suggestion-${s.value}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applySuggestion(s.value)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                                i === activeIndex ? "bg-secondary" : "hover:bg-secondary"
                            }`}
                        >
                            {s.avatar ? (
                                <img src={s.avatar} alt="" className="h-8 w-8 rounded-lg object-cover"/>
                            ) : (
                                <div
                                    className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                    <Hash size={14} strokeWidth={1.75}/>
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-display font-semibold text-sm tracking-tight truncate">{s.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{s.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 mt-3">
                <button
                    type="button"
                    data-testid="composer-add-mention"
                    onClick={() => insertTrigger("@")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors duration-200"
                >
                    <AtSign size={12} strokeWidth={1.75}/> Tag people
                </button>
                <button
                    type="button"
                    data-testid="composer-add-hashtag"
                    onClick={() => insertTrigger("#")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors duration-200"
                >
                    <Hash size={12} strokeWidth={1.75}/> Add hashtag
                </button>
            </div>
        </div>
    );
};
