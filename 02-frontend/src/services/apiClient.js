const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const AUTH_STORAGE_KEY = 'crm_bodega_auth';

function getAccessToken() {
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession)?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => null);

  if (!response.ok) {
    const messages = Array.isArray(data?.message)
      ? data.message
      : [data?.message || 'No se pudo completar la operacion.'];

    const error = new Error(messages.join(' '));
    error.messages = messages;
    throw error;
  }

  return data;
}
