import { request } from './apiClient';

export function getReservations() {
  return request('/reservations');
}
