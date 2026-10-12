/*
 * Contratos da API de autenticação. Os DTOs do back-end .NET devem ter estes
 * mesmos campos (o System.Text.Json já serializa em camelCase por padrão).
 */

/** POST /api/auth/login */
export interface LoginRequest {
  cpf: string; // apenas dígitos, ex.: "12345678909"
  senha: string;
}

/** POST /api/auth/cadastro */
export interface CadastroRequest {
  nome: string;
  cpf: string; // apenas dígitos
  email: string;
  senha: string;
}

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
}

/** Resposta de sucesso do login e do cadastro. */
export interface AuthResponse {
  token: string; // JWT
  usuario: Usuario;
}

/**
 * Corpo de erro esperado (compatível com ProblemDetails / ValidationProblemDetails do ASP.NET).
 * Ex.: { "title": "CPF já cadastrado", "status": 409 }
 */
export interface ApiErrorBody {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
