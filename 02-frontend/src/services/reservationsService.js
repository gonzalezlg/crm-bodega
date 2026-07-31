import { request } from './apiClient';

export function getReservations(filters = {}) {
  const params = new URLSearchParams();

  if (filters.date) {
    params.set('date', filters.date);
  }

  if (filters.experienceId) {
    params.set('experienceId', filters.experienceId);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  const queryString = params.toString();

  return request(`/reservations${queryString ? `?${queryString}` : ''}`);
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

export function confirmReservation(id) {
  return request(`/reservations/${id}/confirm`, {
    method: 'PATCH',
  });
}

export function cancelReservation(id) {
  return request(`/reservations/${id}/cancel`, {
    method: 'PATCH',
  });
}

export function attendReservation(id) {
  return request(`/reservations/${id}/attend`, {
    method: 'PATCH',
  });
}

export function markReservationAsNoShow(id) {
  return request(`/reservations/${id}/no-show`, {
    method: 'PATCH',
  });
}
