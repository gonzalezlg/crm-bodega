import { request } from './apiClient';

export function obtenerExperiences() {
  return request('/experiences');
}

export function obtenerExperiencePorId(id) {
  return request(`/experiences/${id}`);
}

export function crearExperience(datos) {
  return request('/experiences', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarExperience(id, datos) {
  return request(`/experiences/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(datos),
  });
}
