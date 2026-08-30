import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { backendRequest, BackendApiError, backendMultipartRequest } from '#/lib/config/backend-client.ts';
import { clearAuthCookies, getValidAccessToken } from '#/lib/config/session.server.ts';
import type { ChatConversation, ChatMessage, ConversationsPage, MessagesPage } from './chat.types';

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw redirect({ to: '/signin' });
  return token;
}

export const getConversationsFn = createServerFn({ method: 'GET' })
  .validator((data: { cursor?: string; limit?: number; search?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set('cursor', data.cursor);
    if (data.limit) params.set('limit', String(data.limit));
    if (data.search) params.set('search', data.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      return await backendRequest<ConversationsPage>(`/conversations${qs}`, {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: '/signin' });
      }
      throw error;
    }
  });

export const getConversationFn = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<ChatConversation>(`/conversations/${data.id}`, {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: '/signin' });
      }
      throw error;
    }
  });

export const createConversationFn = createServerFn({ method: 'POST' })
  .validator((data: { participantIds: string[]; type?: string; title?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<ChatConversation>(`/conversations`, {
      method: 'POST',
      bearerToken: accessToken,
      body: data,
    });
  });

export const getMessagesFn = createServerFn({ method: 'GET' })
  .validator((data: { conversationId: string; cursor?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set('cursor', data.cursor);
    if (data.limit) params.set('limit', String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      return await backendRequest<MessagesPage>(
        `/conversations/${data.conversationId}/messages${qs}`,
        { bearerToken: accessToken },
      );
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: '/signin' });
      }
      throw error;
    }
  });

export const sendMessageFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      conversationId: string;
      content?: string;
      type?: string;
      sharedPostId?: string;
      sharedProfileUserId?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<ChatMessage>(
      `/conversations/${data.conversationId}/messages`,
      {
        method: 'POST',
        bearerToken: accessToken,
        body: {
          content: data.content,
          type: data.type ?? 'TEXT',
          sharedPostId: data.sharedPostId,
          sharedProfileUserId: data.sharedProfileUserId,
        },
      },
    );
  });

export const markConversationReadFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<{ success: boolean }>(`/conversations/${data.id}/read`, {
      method: 'PATCH',
      bearerToken: accessToken,
    });
  });

export const sendImageMessageFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const conversationId = String(data.get('conversationId') ?? '');
    if (!conversationId) throw new Error('conversationId is required');
    const forward = new FormData();
    const image = data.get('image');
    if (image) forward.append('image', image);
    const content = data.get('content');
    if (content) forward.append('content', String(content));
    return backendMultipartRequest<ChatMessage>(
      `/conversations/${conversationId}/messages/media`,
      forward,
      { method: 'POST', bearerToken: accessToken },
    );
  });
