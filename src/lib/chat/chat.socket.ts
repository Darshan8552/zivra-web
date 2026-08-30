import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getChatSocket } from './ws-client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: string;
  createdAt: string;
  sender?: { id: string; username: string; name: string; avatarUrl: string | null };
}

export function useChatSocket(conversationId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getChatSocket();

    const onMessageNew = (message: ChatMessage) => {
      if (conversationId && message.conversationId !== conversationId) {
        // Still invalidate conversations list for inbox preview
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        return;
      }

      // Append to messages cache if exists
      const key = ['conversations', conversationId, 'messages'] as const;
      // Generic update: invalidate to refetch; optimistic append could be here
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
    };

    const onConversationUpdated = () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onConversationRead = () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
      }
    };

    const onMessageDeleted = () => {
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      }
    };

    const onUnauthorized = (payload: unknown) => {
      console.warn('[chat socket] unauthorized', payload);
    };

    socket.on('message:new', onMessageNew);
    socket.on('conversation:updated', onConversationUpdated);
    socket.on('conversation:read', onConversationRead);
    socket.on('message:deleted', onMessageDeleted);
    socket.on('unauthorized', onUnauthorized);

    socket.on('connect', () => console.log('[chat socket] connected', socket.id));
    socket.on('disconnect', (reason) => console.log('[chat socket] disconnected', reason));

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('conversation:updated', onConversationUpdated);
      socket.off('conversation:read', onConversationRead);
      socket.off('message:deleted', onMessageDeleted);
      socket.off('unauthorized', onUnauthorized);
    };
  }, [conversationId, queryClient]);
}

/** Global inbox socket - subscribes to all conversation updates */
export function useChatInboxSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getChatSocket();

    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message:new', handler);
    socket.on('conversation:updated', handler);

    return () => {
      socket.off('message:new', handler);
      socket.off('conversation:updated', handler);
    };
  }, [queryClient]);
}

export interface TypingUser {
  userId: string;
  name: string;
  username: string;
  conversationId: string;
}

export interface PresenceUpdate {
  userId: string;
  online: boolean;
}

export function usePresence() {
  const [presence, setPresence] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const socket = getChatSocket();
    const handler = (payload: PresenceUpdate) => {
      setPresence((prev) => {
        const next = new Map(prev);
        next.set(payload.userId, payload.online);
        return next;
      });
    };
    socket.on('presence:update', handler);
    return () => {
      socket.off('presence:update', handler);
    };
  }, []);

  return presence;
}

export function useTypingIndicator(conversationId?: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!conversationId) {
      setTypingUsers([]);
      return;
    }
    const socket = getChatSocket();

    const onStart = (payload: TypingUser) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === payload.userId)) return prev;
        return [...prev, payload];
      });
      const existing = timeoutsRef.current.get(payload.userId);
      if (existing) window.clearTimeout(existing);
      const t = window.setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
        timeoutsRef.current.delete(payload.userId);
      }, 2000);
      timeoutsRef.current.set(payload.userId, t);
    };

    const onStop = (payload: { userId: string; conversationId: string }) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
      const t = timeoutsRef.current.get(payload.userId);
      if (t) {
        window.clearTimeout(t);
        timeoutsRef.current.delete(payload.userId);
      }
    };

    socket.on('typing:start', onStart);
    socket.on('typing:stop', onStop);

    return () => {
      socket.off('typing:start', onStart);
      socket.off('typing:stop', onStop);
      for (const t of timeoutsRef.current.values()) window.clearTimeout(t);
      timeoutsRef.current.clear();
    };
  }, [conversationId]);

  return typingUsers;
}
