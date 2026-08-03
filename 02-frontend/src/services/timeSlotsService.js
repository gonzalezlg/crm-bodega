import { request } from './apiClient';

export function obtenerTimeSlotsPorExperience(experienceId) {
  return request(`/experiences/${experienceId}/time-slots`);
}

export function crearTimeSlot(experienceId, datos) {
  return request(`/experiences/${experienceId}/time-slots`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarTimeSlot(id, datos) {
  return request(`/time-slots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(datos),
  });
}
