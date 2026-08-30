import { getBackendUrl } from "#/lib/config/config.ts";

interface BackendRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  bearerToken?: string;
  asServerClient?: boolean;
}

interface BackendSuccessEnvelope<T> {
  success: true;
  statusCode: number;
  data: T;
}

interface BackendErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class BackendApiError extends Error {
  readonly statusCode: number;
  readonly details?: string[];

  constructor(payload: BackendErrorPayload, statusCode: number) {
    super(
      Array.isArray(payload.message)
        ? payload.message.join(" ")
        : payload.message,
    );
    this.name = "BackendApiError";
    this.statusCode = statusCode;
    this.details = Array.isArray(payload.message) ? payload.message : undefined;
  }
}

export async function backendRequest<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, bearerToken, asServerClient = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  if (asServerClient) headers["x-Device-Type"] = "UNKNOWN";

  let res: Response;
  try {
    res = await fetch(`${getBackendUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    console.log(e);
    throw new BackendApiError(
      {
        statusCode: 503,
        message: "Could not reach the server. Please try again.",
      },
      503,
    );
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const errorPayload: BackendErrorPayload = payload ?? {
      statusCode: res.status,
      message: res.statusText,
    };
    throw new BackendApiError(errorPayload, res.status);
  }

  const envelope = payload as BackendSuccessEnvelope<T> | null;
  return (envelope?.data ?? payload) as T;
}

export async function backendMultipartRequest<T>(
  path: string,
  formData: FormData,
  options: Pick<
    BackendRequestOptions,
    "method" | "bearerToken" | "asServerClient"
  > = {},
): Promise<T> {
  const { method = "POST", bearerToken, asServerClient = true } = options;

  const headers: Record<string, string> = {};
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  if (asServerClient) headers["x-Device-Type"] = "UNKNOWN";

  let res: Response;
  try {
    res = await fetch(`${getBackendUrl()}${path}`, {
      method,
      headers,
      body: formData,
    });
  } catch (e) {
    console.log(e);
    throw new BackendApiError(
      {
        statusCode: 503,
        message: "Could not reach the server. Please try again.",
      },
      503,
    );
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const errorPayload: BackendErrorPayload = payload ?? {
      statusCode: res.status,
      message: res.statusText,
    };
    throw new BackendApiError(errorPayload, res.status);
  }

  const envelope = payload as BackendSuccessEnvelope<T> | null;
  return (envelope?.data ?? payload) as T;
}
