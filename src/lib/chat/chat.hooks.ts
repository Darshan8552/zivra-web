import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getConversationsFn,
  getConversationFn,
  getMessagesFn,
  sendMessageFn,
  createConversationFn,
  markConversationReadFn,
  sendImageMessageFn,
} from './chat.function';
import { BackendApiError } from '#/lib/config/backend-client.ts';

function getErrorMessage(error: unknown): string {
  if (error instanceof BackendApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export const conversationsQueryOptions = (search?: string) =>
  infiniteQueryOptions({
    queryKey: ['conversations', search ?? ''] as const,
    queryFn: ({ pageParam }) =>
      getConversationsFn({ data: { cursor: pageParam as string | undefined, search } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const conversationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['conversations', id] as const,
    queryFn: () => getConversationFn({ data: { id } }),
    enabled: Boolean(id),
  });

export const messagesQueryOptions = (conversationId: string) =>
  infiniteQueryOptions({
    queryKey: ['conversations', conversationId, 'messages'] as const,
    queryFn: ({ pageParam }) =>
      getMessagesFn({ data: { conversationId, cursor: pageParam as string | undefined } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(conversationId),
  });

export function useConversations(search?: string) {
  return useInfiniteQuery(conversationsQueryOptions(search));
}

export function useConversation(id: string) {
  return useQuery(conversationQueryOptions(id));
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery(messagesQueryOptions(conversationId));
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input:
        | string
        | {
            content?: string;
            type?: string;
            sharedPostId?: string;
            sharedProfileUserId?: string;
          },
    ) => {
      if (typeof input === 'string') return sendMessageFn({ data: { conversationId, content: input } });
      return sendMessageFn({ data: { conversationId, ...input } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSendPostShare(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sharedPostId: string) =>
      sendMessageFn({ data: { conversationId, type: 'POST_SHARE', sharedPostId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSendProfileShare(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sharedProfileUserId: string) =>
      sendMessageFn({ data: { conversationId, type: 'PROFILE_SHARE', sharedProfileUserId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { participantIds: string[]; type?: string; title?: string }) =>
      createConversationFn({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markConversationReadFn({ data: { id } }),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations', id] });
    },
  });
}

export function useSendImageMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('conversationId', conversationId);
      form.append('image', file);
      return sendImageMessageFn({ data: form });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
