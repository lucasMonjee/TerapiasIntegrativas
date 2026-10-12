/*
 * Back-end SIMULADO para desenvolver o front antes da API existir.
 * Guarda os usuários no localStorage — nunca a senha, só o hash PBKDF2.
 * Ele imita as respostas que a API real deve dar (status 401, 409, 400).
 */
import { ApiError } from './apiClient';
import type { AuthApi } from './authService';
import type { AuthResponse, Usuario } from './types';
import { hashPassword, verifyPassword } from '../utils/hash';
import { isValidCpf, onlyDigits } from '../utils/cpf';
import { isStrongPassword } from '../utils/password';

const STORAGE_KEY = 'mock_usuarios';

interface StoredUser extends Usuario {
  senhaHash: string;
}

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 400));

function toResponse({ senhaHash: _, ...usuario }: StoredUser): AuthResponse {
  return { token: `mock-token-${crypto.randomUUID()}`, usuario };
}

export const mockAuthApi: AuthApi = {
  async login({ cpf, senha }) {
    await delay();
    const user = loadUsers().find((u) => u.cpf === onlyDigits(cpf));
    if (!user || !(await verifyPassword(senha, user.senhaHash))) {
      throw new ApiError(401, 'CPF ou senha inválidos.');
    }
    return toResponse(user);
  },

  async cadastrar({ nome, cpf, email, senha }) {
    await delay();
    const digits = onlyDigits(cpf);
    if (!isValidCpf(digits)) throw new ApiError(400, 'CPF inválido.');
    if (!isStrongPassword(senha)) throw new ApiError(400, 'A senha não atende aos requisitos de segurança.');

    const users = loadUsers();
    if (users.some((u) => u.cpf === digits)) throw new ApiError(409, 'Este CPF já possui cadastro.');

    const user: StoredUser = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      cpf: digits,
      email: email.trim().toLowerCase(),
      senhaHash: await hashPassword(senha),
    };
    saveUsers([...users, user]);
    return toResponse(user);
  },
};
