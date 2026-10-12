import type { ReactNode } from 'react';
import logo from '../assets/logo.jpg';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <img className="brand-logo" src={logo} alt="Debora Monje — Terapias Integrativas" width={160} height={160} />
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>
        {children}
        {footer && <footer className="auth-footer">{footer}</footer>}
      </section>
    </main>
  );
}
