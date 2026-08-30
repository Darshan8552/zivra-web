export interface ChatParticipant {
  id: string;
  userId: string;
  role: string;
  lastReadAt: string | null;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

export interface ChatConversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title: string | null;
  avatarUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  unreadCount: number;
  lastMessage: ChatMessage | null;
  otherParticipant: { id: string; username: string; name: string; avatarUrl: string | null } | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  content: string | null;
  mediaUrl: string | null;
  mediaPublicId: string | null;
  sharedPostId: string | null;
  sharedProfileUserId: string | null;
  replyToMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; username: string; name: string; avatarUrl: string | null };
  replyTo?: ChatMessage | null;
  sharedPost?: { id: string; caption: string | null } | null;
  sharedProfile?: { id: string; username: string; name: string; avatarUrl: string | null } | null;
}

export interface ConversationsPage {
  items: ChatConversation[];
  nextCursor: string | null;
}

export interface MessagesPage {
  items: ChatMessage[];
  nextCursor: string | null;
}
