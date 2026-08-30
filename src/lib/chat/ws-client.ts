import { io, type Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;

function getWsBaseUrl() {
  const backendUrl = (import.meta as unknown as Record<string, unknown>).env
    ? (import.meta.env as Record<string, string>).VITE_BACKEND_URL ?? import.meta.env.BACKEND_URL
    : undefined;

  // Fallback to BACKEND_URL from .env parsing - vite exposes only VITE_ prefixed
  // so we derive from known http://localhost:3001/api/v1
  const raw = backendUrl ?? 'http://localhost:3001/api/v1';
  return raw.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
}

export function getChatSocket(token?: string): Socket {
  if (chatSocket?.connected) return chatSocket;
  if (chatSocket) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
  }

  const base = getWsBaseUrl();

  chatSocket = io(`${base}/chat`, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
  });

  return chatSocket;
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}

export function getExistingChatSocket(): Socket | null {
  return chatSocket;
}
