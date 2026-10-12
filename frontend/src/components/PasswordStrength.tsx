import { PASSWORD_RULES, STRENGTH_LABELS, passwordStrength } from '../utils/password';

/** Barra de força + checklist das recomendações de senha forte. */
export function PasswordStrength({ password }: { password: string }) {
  const level = passwordStrength(password);

  return (
    <div className="password-strength">
      <div className="strength-bar" data-level={level} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= level ? 'filled' : ''} />
        ))}
      </div>
      {level > 0 && (
        <p className="strength-label" aria-live="polite">
          Força da senha: <strong>{STRENGTH_LABELS[level]}</strong>
        </p>
      )}
      <ul className="password-rules">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className={ok ? 'ok' : ''}>
              <span aria-hidden="true">{ok ? '✓' : '•'}</span>
              {rule.label}
              <span className="sr-only">{ok ? ' (atendido)' : ' (pendente)'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
