export interface AuthUser {
    id: string;
    email: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    isVerified: boolean;
    isPrivate: boolean;
    role: string;
    status: string;
    followerCount: number;
    followingCount: number;
    emailVerifiedAt: string | null;
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export type ResendableOtpPurpose = "REGISTER" | "FORGOT_PASSWORD";
