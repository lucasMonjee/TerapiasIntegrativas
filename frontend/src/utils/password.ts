export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Regras de senha forte. Mantenha estas regras iguais às validadas no back-end —
 * a validação do front é apenas para experiência do usuário, a do back é a que vale.
 */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Um número', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Um caractere especial (!@#$%...)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'spaces', label: 'Sem espaços', test: (p) => p.length > 0 && !/\s/.test(p) },
];

export function failedRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

export function isStrongPassword(password: string): boolean {
  return failedRules(password).length === 0;
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Nível de força para a barra visual:
 * 0 = vazia, 1 = fraca, 2 = razoável (quase lá), 3 = boa (atende todas as regras),
 * 4 = forte (atende todas as regras e tem 12+ caracteres).
 */
export function passwordStrength(password: string): StrengthLevel {
  if (!password) return 0;
  const failed = failedRules(password).length;
  if (failed === 0) return password.length >= 12 ? 4 : 3;
  return failed <= 2 ? 2 : 1;
}

export const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: '',
  1: 'Fraca',
  2: 'Razoável',
  3: 'Boa',
  4: 'Forte',
};
