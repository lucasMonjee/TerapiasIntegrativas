import { useAuth } from '../context/AuthContext';
import { maskCpf } from '../utils/cpf';

/** Página inicial provisória após o login — substitua pelo conteúdo real do sistema. */
export function HomePage() {
  const { usuario, logout } = useAuth();

  return (
    <main className="home-page">
      <header className="home-header">
        <span className="brand-name">Terapias Integrativas</span>
        <button type="button" className="btn-secondary" onClick={logout}>
          Sair
        </button>
      </header>
      <section className="home-content">
        <h1>Olá, {usuario?.nome.split(' ')[0]}!</h1>
        <p>Você está logado com o CPF {usuario && maskCpf(usuario.cpf)}.</p>
      </section>
    </main>
  );
}
