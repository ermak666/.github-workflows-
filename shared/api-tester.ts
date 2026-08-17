export type ApiMethod = "GET" | "POST";
export type ApiTestResult = { status: number; durationMs: number; headers: Array<[string, string]>; body: string };

export function validatePublicEndpoint(rawUrl: string, method: ApiMethod, body: string): string | null {
  if (rawUrl.length > 2048) return "URL слишком длинный.";
  if (body.length > 10000) return "Тело запроса ограничено 10 000 символов.";
  let url: URL;
  try { url = new URL(rawUrl); } catch { return "Введите корректный полный URL, начинающийся с https://."; }
  if (url.protocol !== "https:") return "Для учебного тестера разрешены только защищённые адреса https://.";
  if (url.username || url.password) return "Не добавляйте логин или пароль в URL.";
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "::1" || /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return "Локальные и приватные адреса недоступны в учебном тестере.";
  if (method === "GET" && body.trim()) return "Для GET очистите тело запроса.";
  return null;
}

export async function runPublicApiRequest(rawUrl: string, method: ApiMethod, body: string): Promise<ApiTestResult> {
  const invalid = validatePublicEndpoint(rawUrl, method, body); if (invalid) throw new Error(invalid);
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000); const started = Date.now();
  try {
    const response = await fetch(rawUrl, { method, headers: method === "POST" ? { "Content-Type": "application/json" } : undefined, body: method === "POST" ? body : undefined, signal: controller.signal });
    const text = (await response.text()).slice(0, 12000);
    return { status: response.status, durationMs: Date.now() - started, headers: Array.from(response.headers.entries()).slice(0, 12), body: text || "(пустой ответ)" };
  } finally { clearTimeout(timer); }
}
