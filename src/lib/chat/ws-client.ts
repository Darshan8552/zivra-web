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
  // If called without token but we already have an authenticated socket, reuse it
  if (chatSocket?.connected && !token) return chatSocket;
  // Reuse connected socket if same token
  if (chatSocket?.connected && token) {
    const currentToken = (chatSocket.auth as Record<string, unknown> | undefined)?.token as string | undefined;
    if (currentToken === token) return chatSocket;
    // token changed, disconnect and recreate
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }
  if (chatSocket && !chatSocket.connected) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }

  const base = getWsBaseUrl();

  chatSocket = io(`${base}/chat`, {
    withCredentials: true,
    autoConnect: true,
    transports: ['polling', 'websocket'],
    auth: token ? { token } : undefined,
  });

  // Helpful debug for Vercel -> Render cross-site WS
  if (typeof window !== 'undefined') {
    chatSocket.on('connect_error', (err: Error) => {
      console.warn('[chat socket] connect_error', err.message, { base: `${base}/chat`, hasToken: !!token });
    });
  }

  return chatSocket;
}

export async function getAuthenticatedChatSocket(): Promise<Socket | null> {
  try {
    const { getWsTokenFn } = await import('#/lib/auth/auth.function.ts');
    const { token } = await getWsTokenFn();
    if (!token) {
      console.warn('[chat socket] no token — not connecting');
      return null;
    }
    return getChatSocket(token);
  } catch (e) {
    console.warn('[chat socket] failed to get token', e);
    return null;
  }
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
