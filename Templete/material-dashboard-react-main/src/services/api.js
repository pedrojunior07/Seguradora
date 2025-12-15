const DEFAULT_BASE_URL = "http://127.0.0.1:8000/api";

function getBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

function getToken() {
  return localStorage.getItem("seguradora_token");
}

export function setToken(token) {
  if (!token) localStorage.removeItem("seguradora_token");
  else localStorage.setItem("seguradora_token", token);
}

export async function apiRequest(path, { method = "GET", body, headers, token, ...rest } = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const resolvedToken = token ?? getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    Accept: "application/json",
    ...(!isFormData && body ? { "Content-Type": "application/json" } : null),
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : null),
    ...(headers || null),
  };

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : null),
    ...rest,
  });

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `${response.status} ${response.statusText}` ||
      "Erro na requisição";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
