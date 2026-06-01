
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];


export type ApiErrorBody = JsonObject & { message?: string };

export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody;
  readonly url: string;

  constructor(params: { message: string; status: number; url: string; body?: ApiErrorBody }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.url = params.url;
    this.body = params.body;
  }
}

function getEnvToken(): string {
  const t = import.meta.env.VITE_HARF_TOKEN as string | undefined;
  if (!t) throw new Error("Missing VITE_HARF_TOKEN in .env.local");
  const trimmed = t.trim();
  if (!trimmed) throw new Error("VITE_HARF_TOKEN is empty");
  return trimmed;
}

function isJsonResponse(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.includes("application/json") || contentType.includes("+json");
}

function isJsonValue(v: unknown): v is JsonValue {
  if (v === null) return true;
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return true;
  if (Array.isArray(v)) return v.every(isJsonValue);
  if (t === "object") {
    const obj = v as Record<string, unknown>;
    return Object.values(obj).every(isJsonValue);
  }
  return false;
}

async function readResponseBody(res: Response): Promise<{ text?: string; json?: JsonValue }> {
  const ct = res.headers.get("content-type");
  if (isJsonResponse(ct)) {

    const raw: unknown = await res.json().catch(() => null);
    if (isJsonValue(raw)) return { json: raw };
   
    const txt = typeof raw === "string" ? raw : JSON.stringify(raw);
    return { text: txt };
  }

  const text = await res.text().catch(() => "");
  return { text };
}

type ApiFetchInit = Omit<RequestInit, "method" | "body"> & {
  method?: HttpMethod;
 
  json?: JsonValue;
  formData?: FormData;

  body?: BodyInit;
  
  signal?: AbortSignal;
};

type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string;
};

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";
  const getToken = options.getToken ?? getEnvToken;

  async function request<TResponse>(path: string, init: ApiFetchInit = {}): Promise<TResponse> {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

    const method: HttpMethod = init.method ?? (init.json || init.formData || init.body ? "POST" : "GET");

    const headers = new Headers(init.headers);

    
    headers.set("Authorization", `Bearer ${getToken()}`);


    let body: BodyInit | undefined;

    if (init.formData) {
      body = init.formData;
      
    } else if (init.json !== undefined) {
      body = JSON.stringify(init.json);
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (!headers.has("Accept")) headers.set("Accept", "application/json");
    } else if (init.body !== undefined) {
      body = init.body;
    }

    const res = await fetch(url, {
      ...init,
      method,
      headers,
      body,
    });

    const parsed = await readResponseBody(res);

    if (!res.ok) {
      const bodyJson = parsed.json && typeof parsed.json === "object" && !Array.isArray(parsed.json)
        ? (parsed.json as ApiErrorBody)
        : undefined;

      const msg =
        bodyJson?.message ??
        (parsed.text ? parsed.text : `Request failed with status ${res.status}`);

      throw new ApiError({
        message: msg,
        status: res.status,
        url,
        body: bodyJson,
      });
    }

   
    if (parsed.json !== undefined) return parsed.json as unknown as TResponse;

  
    return (parsed.text ?? "") as unknown as TResponse;
  }

  return { request };
}


