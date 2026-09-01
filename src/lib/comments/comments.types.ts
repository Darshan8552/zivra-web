export interface CommentAuthor {
	id: string;
	username: string;
	name: string;
	avatarUrl: string | null;
	isVerified: boolean;
}

export interface Comment {
	id: string;
	postId: string;
	userId: string;
	content: string;
	parentId: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	user: CommentAuthor;
	_count: { likes: number; replies: number };
	liked?: boolean;
}

export interface CommentsPage {
	items: Comment[];
	nextCursor: string | null;
}
