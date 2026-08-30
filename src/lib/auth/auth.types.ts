export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followStatus: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const PURPOSES = ["REGISTER", "FORGOT_PASSWORD"] as const;
