import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { isValidCpf, maskCpf, onlyDigits } from '../utils/cpf';

interface LocationState {
  from?: { pathname: string };
  cadastroCpf?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;

  const [cpf, setCpf] = useState(state.cadastroCpf ? maskCpf(state.cadastroCpf) : '');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ cpf?: string; senha?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [semCadastro, setSemCadastro] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSemCadastro(false);

    const newErrors: typeof errors = {};
    if (!cpf) newErrors.cpf = 'Informe seu CPF.';
    else if (!isValidCpf(cpf)) newErrors.cpf = 'CPF inválido.';
    if (!senha) newErrors.senha = 'Informe sua senha.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      await login({ cpf: onlyDigits(cpf), senha });
      navigate(state.from?.pathname ?? '/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Mensagem genérica de propósito: não revela se o CPF existe ou não.
        setFormError('CPF ou senha inválidos.');
        setSemCadastro(true);
      } else {
        setFormError(error instanceof Error ? error.message : 'Erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta com seu CPF e senha."
      footer={
        <p>
          Ainda não tem acesso? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-error" role="alert">
            <p>{formError}</p>
            {semCadastro && (
              <p>
                Se você ainda não possui cadastro, <Link to="/cadastro" state={{ cpf: onlyDigits(cpf) }}>crie sua conta aqui</Link>.
              </p>
            )}
          </div>
        )}

        <FormField
          label="CPF"
          name="cpf"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(maskCpf(e.target.value))}
          error={errors.cpf}
          autoFocus={!state.cadastroCpf}
        />

        <FormField
          label="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={errors.senha}
          autoFocus={!!state.cadastroCpf}
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
