import {toast} from "sonner";
import {isHashtagToken, isMentionToken, TOKEN_SPLIT_RE} from "#/lib/text.ts";

export const RichText = ({text}: { text: string }) => {
    const parts = text.split(TOKEN_SPLIT_RE);
    return (
        <>
            {parts.map((part, i) => {
                if (isHashtagToken(part)) {
                    return (
                        <button
                            key={i}
                            type="button"
                            data-testid={`hashtag-${part.slice(1)}`}
                            onClick={() => toast(`Browsing ${part}`)}
                            className="text-accent font-medium hover:underline"
                        >
                            {part}
                        </button>
                    );
                }
                if (isMentionToken(part)) {
                    return (
                        <button
                            key={i}
                            type="button"
                            data-testid={`mention-${part.slice(1)}`}
                            onClick={() => toast(`Open ${part}`)}
                            className="text-accent font-medium hover:underline"
                        >
                            {part}
                        </button>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};
