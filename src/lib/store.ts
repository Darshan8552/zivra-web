import {useSyncExternalStore} from "react";
import {
    currentUser,
    myPosts,
    posts as seedFeedPosts,
    type PostsType,
    taggedPosts as seedTaggedPosts
} from "#/lib/mock.ts";

let feedPosts: PostsType[] = [...seedFeedPosts];
let ownPosts: PostsType[] = [...myPosts];
let taggedPosts: PostsType[] = [...seedTaggedPosts];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const postsStore = {
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getFeedPosts: () => feedPosts,
    getOwnPosts: () => ownPosts,
    getTaggedPosts: () => taggedPosts,
    addPost(input: {
        image: string;
        caption: string;
        location: string;
        hashtags?: string[];
        mentions?: string[];
        likesEnabled?: boolean;
        commentsEnabled?: boolean;
        sharesEnabled?: boolean;
    }) {
        const post: PostsType = {
            id: `p_${Date.now()}`,
            user: {name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar},
            isOwner: true,
            location: input.location || "Unknown",
            time: "now",
            caption: input.caption,
            image: input.image,
            likes: 0,
            comments: 0,
            shares: 0,
            liked: false,
            bookmarked: false,
            hashtags: input.hashtags ?? [],
            mentions: input.mentions ?? [],
            likesEnabled: input.likesEnabled ?? true,
            commentsEnabled: input.commentsEnabled ?? true,
            sharesEnabled: input.sharesEnabled ?? true,
        };
        feedPosts = [post, ...feedPosts];
        ownPosts = [post, ...ownPosts];
        emit();
        return post;
    },
};

export const useFeedPosts = () =>
    useSyncExternalStore(postsStore.subscribe, postsStore.getFeedPosts, postsStore.getFeedPosts);

export const useOwnPosts = () =>
    useSyncExternalStore(postsStore.subscribe, postsStore.getOwnPosts, postsStore.getOwnPosts);

export const useTaggedPosts = () =>
    useSyncExternalStore(postsStore.subscribe, postsStore.getTaggedPosts, postsStore.getTaggedPosts);
