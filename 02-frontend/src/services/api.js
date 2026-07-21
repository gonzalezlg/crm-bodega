const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(' ')
      : data?.message || 'Ocurrió un error al comunicarse con el servidor.';

    throw new Error(message);
  }

  return data;
}

export const api = {
  post(path, body, options = {}) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  },
};
