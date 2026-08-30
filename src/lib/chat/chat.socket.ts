import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getAuthenticatedChatSocket } from './ws-client';

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
    let socket: Socket | null = null;
    let cancelled = false;

    const setup = async () => {
      const s = await getAuthenticatedChatSocket();
      if (cancelled || !s) return;
      socket = s;

      const onMessageNew = (message: ChatMessage) => {
        if (conversationId && message.conversationId !== conversationId) {
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
          return;
        }
        const key = ['conversations', conversationId, 'messages'] as const;
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

      const onConnect = () => console.log('[chat socket] connected', socket?.id);
      const onDisconnect = (reason: string) => console.log('[chat socket] disconnected', reason);
      const onConnectError = (err: Error) => console.warn('[chat socket] connect_error', err.message);

      socket.on('message:new', onMessageNew);
      socket.on('conversation:updated', onConversationUpdated);
      socket.on('conversation:read', onConversationRead);
      socket.on('message:deleted', onMessageDeleted);
      socket.on('unauthorized', onUnauthorized);
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);

      // Store handlers for cleanup via closure
      (socket as unknown as Record<string, unknown>).__handlers = {
        onMessageNew,
        onConversationUpdated,
        onConversationRead,
        onMessageDeleted,
        onUnauthorized,
        onConnect,
        onDisconnect,
        onConnectError,
      };
    };

    void setup();

    return () => {
      cancelled = true;
      if (socket) {
        const h = (socket as unknown as Record<string, unknown>).__handlers as Record<string, (...args: unknown[]) => void> | undefined;
        if (h) {
          socket.off('message:new', h.onMessageNew);
          socket.off('conversation:updated', h.onConversationUpdated);
          socket.off('conversation:read', h.onConversationRead);
          socket.off('message:deleted', h.onMessageDeleted);
          socket.off('unauthorized', h.onUnauthorized);
          socket.off('connect', h.onConnect);
          socket.off('disconnect', h.onDisconnect);
          socket.off('connect_error', h.onConnectError);
        }
      }
    };
  }, [conversationId, queryClient]);
}

/** Global inbox socket - subscribes to all conversation updates */
export function useChatInboxSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };
    const setup = async () => {
      const s = await getAuthenticatedChatSocket();
      if (cancelled || !s) return;
      socket = s;
      socket.on('message:new', handler);
      socket.on('conversation:updated', handler);
    };
    void setup();
    return () => {
      cancelled = true;
      if (socket) {
        socket.off('message:new', handler);
        socket.off('conversation:updated', handler);
      }
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
    let socket: Socket | null = null;
    let cancelled = false;
    const handler = (payload: PresenceUpdate) => {
      setPresence((prev) => {
        const next = new Map(prev);
        next.set(payload.userId, payload.online);
        return next;
      });
    };
    const setup = async () => {
      const s = await getAuthenticatedChatSocket();
      if (cancelled || !s) return;
      socket = s;
      socket.on('presence:update', handler);
    };
    void setup();
    return () => {
      cancelled = true;
      if (socket) socket.off('presence:update', handler);
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
    let socket: Socket | null = null;
    let cancelled = false;

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

    const setup = async () => {
      const s = await getAuthenticatedChatSocket();
      if (cancelled || !s) return;
      socket = s;
      socket.on('typing:start', onStart);
      socket.on('typing:stop', onStop);
    };
    void setup();

    return () => {
      cancelled = true;
      if (socket) {
        socket.off('typing:start', onStart);
        socket.off('typing:stop', onStop);
      }
      for (const t of timeoutsRef.current.values()) window.clearTimeout(t);
      timeoutsRef.current.clear();
    };
  }, [conversationId]);

  return typingUsers;
}
