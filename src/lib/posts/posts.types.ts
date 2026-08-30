export interface PostMediaItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface PostAuthor {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface PostHashtagItem {
  postId: string;
  hashtagId: string;
  hashtag: { id: string; name: string };
}

export interface PostUserTagItem {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface Post {
  id: string;
  userId: string;
  caption: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  allowComments: boolean;
  allowLikes: boolean;
  allowShare: boolean;
  createdAt: string;
  updatedAt: string;
  user: PostAuthor;
  media: PostMediaItem[];
  hashtags: PostHashtagItem[];
  userTags: PostUserTagItem[];
  _count: { likes: number; comments: number };
  liked: boolean;
  bookmarked: boolean;
}

export interface HashtagSuggestion {
  id: string;
  name: string;
  postCount: number;
}

export interface UserSuggestion {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
}
