export const TOKEN_SPLIT_RE = /(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_.]+)/g;
const HASHTAG_RE = /^#[a-zA-Z0-9_]+$/;
const MENTION_RE = /^@[a-zA-Z0-9_.]+$/;

export const isHashtagToken = (s: string) => HASHTAG_RE.test(s);
export const isMentionToken = (s: string) => MENTION_RE.test(s);

export function extractTags(text: string) {
    const hashtags = new Set<string>();
    const mentions = new Set<string>();
    const matches = text.match(TOKEN_SPLIT_RE) ?? [];
    for (const m of matches) {
        if (m.startsWith("#")) hashtags.add(m.slice(1));
        else mentions.add(m.slice(1));
    }
    return {hashtags: [...hashtags], mentions: [...mentions]};
}
