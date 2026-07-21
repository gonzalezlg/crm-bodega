import { api } from './api';

export function loginRequest({ email, password }) {
  return api.post('/auth/login', {
    emailOrDni: email,
    password,
  });
}
