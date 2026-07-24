const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const AUTH_STORAGE_KEY = 'crm_bodega_auth';

/**
 * Obtiene el token almacenado por AuthContext.
 */
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
    const message = Array.isArray(data?.message)
      ? data.message.join(' ')
      : data?.message || 'No se pudo completar la operación.';

    throw new Error(message);
  }

  return data;
}

export function obtenerClientes({ search = '', activo = true } = {}) {
  const params = new URLSearchParams({
    activo: String(activo),
  });

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  return request(`/api/clientes?${params.toString()}`);
}

export function crearCliente(datos) {
  return request('/api/clientes', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarCliente(id, datos) {
  return request(`/api/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export function desactivarCliente(id) {
  return request(`/api/clientes/${id}/desactivar`, {
    method: 'PATCH',
  });
}
