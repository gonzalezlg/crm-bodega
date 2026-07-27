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

export function obtenerProductos({
  page,
  limit,
  search = '',
  categoriaId,
  activo,
} = {}) {
  const params = new URLSearchParams();
  const normalizedSearch = search.trim();

  if (page !== undefined) {
    params.set('page', String(page));
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  if (categoriaId !== undefined) {
    params.set('categoriaId', categoriaId);
  }

  if (activo !== undefined) {
    params.set('activo', String(activo));
  }

  const queryString = params.toString();

  return request(`/api/productos${queryString ? `?${queryString}` : ''}`);
}

export function obtenerProductoPorId(id) {
  return request(`/api/productos/${id}`);
}

export function crearProducto(data) {
  return request('/api/productos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function actualizarProducto(id, data) {
  return request(`/api/productos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function actualizarEstadoProducto(id, activo) {
  return request(`/api/productos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({
      activo,
    }),
  });
}
