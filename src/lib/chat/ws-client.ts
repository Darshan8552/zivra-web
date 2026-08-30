import { io, type Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;

function getWsBaseUrl() {
  // Vite only exposes VITE_ prefixed vars to the browser.
  // VITE_BACKEND_URL must be set in Vercel env for prod (https://zivra-api.onrender.com/api/v1).
  const viteUrl = (import.meta.env as Record<string, string | undefined>).VITE_BACKEND_URL;
  // In dev, allow fallback to localhost if not set.
  const isProd = (import.meta.env as Record<string, string | undefined>).PROD === 'true';
  const raw = viteUrl ?? (isProd ? 'https://zivra-api.onrender.com/api/v1' : 'http://localhost:3001/api/v1');
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
