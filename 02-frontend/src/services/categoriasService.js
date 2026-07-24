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

async function request(path, options = {}) {
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

export function obtenerCategorias({ search = '', activo = true } = {}) {
  const params = new URLSearchParams({
    activo: String(activo),
  });

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  return request(`/api/categorias?${params.toString()}`);
}

export function obtenerCategoria(id) {
  return request(`/api/categorias/${id}`);
}

export function crearCategoria(datos) {
  return request('/api/categorias', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarCategoria(id, datos) {
  return request(`/api/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoCategoria(id, activo) {
  return request(`/api/categorias/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}
