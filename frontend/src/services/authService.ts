import { apiRequest } from './apiClient';
import { mockAuthApi } from './mockAuthApi';
import type { AuthResponse, CadastroRequest, LoginRequest } from './types';

export interface AuthApi {
  login(data: LoginRequest): Promise<AuthResponse>;
  cadastrar(data: CadastroRequest): Promise<AuthResponse>;
}

const realAuthApi: AuthApi = {
  login: (data) => apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  cadastrar: (data) => apiRequest<AuthResponse>('/auth/cadastro', { method: 'POST', body: JSON.stringify(data) }),
};

/** Troque VITE_USE_MOCK_API para false quando a API .NET estiver pronta. */
export const authService: AuthApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockAuthApi : realAuthApi;
