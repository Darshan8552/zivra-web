import { useEffect, useState } from "react";

const LIKED_KEY = "pulse:liked-posts";
const BOOKMARKED_KEY = "pulse:bookmarked-posts";

function getSet(key: string): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = window.localStorage.getItem(key);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
}

function saveSet(key: string, set: Set<string>): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify([...set]));
}

export function useLikedState(postId: string, serverLiked?: boolean) {
	const [liked, setLikedState] = useState<boolean>(() => {
		if (serverLiked !== undefined) return serverLiked;
		return getSet(LIKED_KEY).has(postId);
	});

	useEffect(() => {
		if (serverLiked === undefined) return;
		setLikedState(serverLiked);
		const set = getSet(LIKED_KEY);
		if (serverLiked) set.add(postId);
		else set.delete(postId);
		saveSet(LIKED_KEY, set);
	}, [serverLiked, postId]);

	const setLiked = (value: boolean) => {
		setLikedState(value);
		const set = getSet(LIKED_KEY);
		if (value) set.add(postId);
		else set.delete(postId);
		saveSet(LIKED_KEY, set);
	};

	return [liked, setLiked] as const;
}

export function useBookmarkedState(postId: string, serverBookmarked?: boolean) {
	const [bookmarked, setBookmarkedState] = useState<boolean>(() => {
		if (serverBookmarked !== undefined) return serverBookmarked;
		return getSet(BOOKMARKED_KEY).has(postId);
	});

	useEffect(() => {
		if (serverBookmarked === undefined) return;
		setBookmarkedState(serverBookmarked);
		const set = getSet(BOOKMARKED_KEY);
		if (serverBookmarked) set.add(postId);
		else set.delete(postId);
		saveSet(BOOKMARKED_KEY, set);
	}, [serverBookmarked, postId]);

	const setBookmarked = (value: boolean) => {
		setBookmarkedState(value);
		const set = getSet(BOOKMARKED_KEY);
		if (value) set.add(postId);
		else set.delete(postId);
		saveSet(BOOKMARKED_KEY, set);
	};

	return [bookmarked, setBookmarked] as const;
}
