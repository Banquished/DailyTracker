import { apiClient } from '../../../api/client';
import type { AuthToken, LoginCredentials, RegisterCredentials, User } from '../domain/types';

export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const form = new FormData();
  form.append('username', credentials.email);
  form.append('password', credentials.password);

  const response = await apiClient.post<AuthToken>('/auth/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', credentials);
  return response.data;
}
