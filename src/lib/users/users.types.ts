import type { AuthUser } from "#/lib/auth/auth.types.ts";

export type UserProfile = AuthUser;

export interface SuggestionUser {
	id: string;
	name: string;
	username: string;
	avatarUrl: string | null;
	isVerified: boolean;
	isPrivate: boolean;
	reason: string;
}

export interface FollowState {
	isFollowing: boolean;
	followStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
	followerCount: number;
}

export interface ProfilePostMedia {
	id: string;
	url: string;
	type: "IMAGE" | "VIDEO";
}

export interface ProfilePostSummary {
	id: string;
	caption: string | null;
	createdAt: string;
	media: ProfilePostMedia[];
	_count: { likes: number; comments: number };
}

export interface ProfilePostsPage {
	items: ProfilePostSummary[];
	nextCursor: string | null;
}

export interface FollowUser {
	id: string;
	name: string;
	username: string;
	avatarUrl: string | null;
	isVerified: boolean;
	isPrivate: boolean;
	isFollowing: boolean;
	followStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

export interface FollowListPage {
	items: FollowUser[];
	nextCursor: string | null;
}
