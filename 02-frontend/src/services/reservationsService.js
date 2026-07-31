import { request } from './apiClient';

export function getReservations() {
  return request('/reservations');
}

export function getReservationById(id) {
  return request(`/reservations/${id}`);
}

export function createReservation(data) {
  return request('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateReservation(id, data) {
  return request(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getAvailability(experienceId, date) {
  return request(`/experiences/${experienceId}/availability?date=${date}`);
}
