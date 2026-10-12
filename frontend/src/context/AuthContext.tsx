import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { setAuthToken } from '../services/apiClient';
import { authService } from '../services/authService';
import type { AuthResponse, CadastroRequest, LoginRequest, Usuario } from '../services/types';

const SESSION_KEY = 'auth_session';

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login(data: LoginRequest): Promise<void>;
  cadastrar(data: CadastroRequest): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/*
 * A sessão fica no sessionStorage (some ao fechar o navegador).
 * Para produção, considere o back-end devolver o JWT num cookie HttpOnly + Secure,
 * assim o token não fica acessível ao JavaScript.
 */
function loadSession(): AuthResponse | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const session = raw ? (JSON.parse(raw) as AuthResponse) : null;
    setAuthToken(session?.token ?? null);
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(loadSession);

  const startSession = useCallback((response: AuthResponse) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(response));
    setAuthToken(response.token);
    setSession(response);
  }, []);

  const login = useCallback(async (data: LoginRequest) => startSession(await authService.login(data)), [startSession]);

  const cadastrar = useCallback(
    async (data: CadastroRequest) => startSession(await authService.cadastrar(data)),
    [startSession],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario: session?.usuario ?? null, isAuthenticated: !!session, login, cadastrar, logout }),
    [session, login, cadastrar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return context;
}
