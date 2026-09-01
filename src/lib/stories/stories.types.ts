export interface StoryUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user: StoryUser;
  mediaUrl: string;
  publicId: string;
  type: "IMAGE" | "VIDEO";
  visibility: "PUBLIC" | "CLOSE_FRIENDS";
  expiresAt: string;
  createdAt: string;
  views?: string[];
  viewCount?: number;
  viewed?: boolean;
}

export interface StoryGroup {
  user: StoryUser;
  stories: Story[];
  seenAll: boolean;
  latestAt: string;
}

export interface StoriesPage {
  groups: StoryGroup[];
  nextCursor: string | null;
}
