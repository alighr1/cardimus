export class ApiError extends Error {
  constructor(message: string, public debug?: unknown) {
    super(message);
  }
}

async function requestJson<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    window.location.href = "/login"; // session expired
    throw new ApiError("Please log in.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, data.debug);
  return data as T;
}

export const postJson = <T>(url: string, body: unknown) => requestJson<T>(url, body);
export const getJson = <T>(url: string) => requestJson<T>(url);
export const sendJson = <T>(method: "PUT" | "DELETE", url: string, body?: unknown) => requestJson<T>(url, body, method);
