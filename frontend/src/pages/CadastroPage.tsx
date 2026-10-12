import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { PasswordStrength } from '../components/PasswordStrength';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { isValidCpf, maskCpf, onlyDigits } from '../utils/cpf';
import { isStrongPassword } from '../utils/password';

interface FormState {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.nome.trim().split(/\s+/).length < 2) errors.nome = 'Informe seu nome completo.';
  if (!isValidCpf(form.cpf)) errors.cpf = 'CPF inválido.';
  if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'E-mail inválido.';
  if (!isStrongPassword(form.senha)) errors.senha = 'A senha não atende a todas as recomendações abaixo.';
  if (!form.confirmarSenha) errors.confirmarSenha = 'Confirme sua senha.';
  else if (form.confirmarSenha !== form.senha) errors.confirmarSenha = 'As senhas não coincidem.';
  return errors;
}

/** Converte os erros de validação do ASP.NET ({ Cpf: ["..."] }) para os campos do formulário. */
function mapServerErrors(serverErrors?: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, messages] of Object.entries(serverErrors ?? {})) {
    const field = (key.charAt(0).toLowerCase() + key.slice(1)) as keyof FormState;
    mapped[field] = messages[0];
  }
  return mapped;
}

export function CadastroPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const initialCpf = ((useLocation().state ?? {}) as { cpf?: string }).cpf;

  const [form, setForm] = useState<FormState>({
    nome: '',
    cpf: initialCpf ? maskCpf(initialCpf) : '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [cpfJaCadastrado, setCpfJaCadastrado] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'cpf' ? maskCpf(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setCpfJaCadastrado(false);

    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    try {
      await cadastrar({
        nome: form.nome.trim(),
        cpf: onlyDigits(form.cpf),
        email: form.email.trim(),
        senha: form.senha,
      });
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) setCpfJaCadastrado(true);
        setErrors(mapServerErrors(error.errors));
        setFormError(error.message);
      } else {
        setFormError('Erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Preencha seus dados para ter acesso."
      footer={
        <p>
          Já tem cadastro? <Link to="/login">Entrar</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-error" role="alert">
            <p>{formError}</p>
            {cpfJaCadastrado && (
              <p>
                <Link to="/login" state={{ cadastroCpf: onlyDigits(form.cpf) }}>Fazer login com este CPF</Link>
              </p>
            )}
          </div>
        )}

        <FormField
          label="Nome completo"
          name="nome"
          autoComplete="name"
          value={form.nome}
          onChange={update('nome')}
          error={errors.nome}
          autoFocus
        />
        <FormField
          label="CPF"
          name="cpf"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          value={form.cpf}
          onChange={update('cpf')}
          error={errors.cpf}
        />
        <FormField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <FormField
          label="Senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          value={form.senha}
          onChange={update('senha')}
          error={errors.senha}
        />
        <PasswordStrength password={form.senha} />
        <FormField
          label="Confirmar senha"
          name="confirmarSenha"
          type="password"
          autoComplete="new-password"
          value={form.confirmarSenha}
          onChange={update('confirmarSenha')}
          error={errors.confirmarSenha}
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
