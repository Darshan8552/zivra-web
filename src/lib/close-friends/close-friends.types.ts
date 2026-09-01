export interface CloseFriendUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
}

export interface CloseFriend {
  id: string;
  userId: string;
  friendId: string;
  friend: CloseFriendUser;
  createdAt: string;
}
