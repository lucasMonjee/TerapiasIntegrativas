# Terapias Integrativas — Front-end (React)

React 19 + TypeScript + Vite + React Router.

## Como rodar

```bash
cd frontend
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev                  # http://localhost:5173
```

Enquanto a API não existe, `VITE_USE_MOCK_API=true` faz o front usar um **back-end simulado**
(`src/services/mockAuthApi.ts`), que guarda os usuários no `localStorage` do navegador — só com o
hash da senha, nunca a senha. Quando a API .NET estiver pronta, mude para `false`.

## Telas

| Rota        | Tela                                                                              |
|-------------|-----------------------------------------------------------------------------------|
| `/login`    | Login com CPF (com máscara e validação) + senha. Se falhar, oferece o cadastro.   |
| `/cadastro` | Nome, CPF, e-mail, senha (com medidor de força e regras) e confirmação de senha.  |
| `/`         | Página inicial protegida (provisória) — só acessível logado.                      |

## Regras de senha forte

Mínimo de 8 caracteres, uma maiúscula, uma minúscula, um número, um caractere especial e sem espaços.
Definidas em `src/utils/password.ts` e espelhadas no back-end em
`TerapiasIntegrativas.Application/Validation/PasswordPolicy.cs`. **O back-end deve validar sempre** —
a validação do front é só para a experiência do usuário.

## Sobre o hash da senha

O front envia a senha em texto **via HTTPS** e o **back-end gera o hash** antes de salvar. Já está pronto:

- `TerapiasIntegrativas.Application/Interfaces/IPasswordHasher.cs`
- `TerapiasIntegrativas.Infra.Data/Security/Pbkdf2PasswordHasher.cs` — PBKDF2-SHA256, 100.000 iterações,
  salt aleatório de 16 bytes, comparação em tempo constante. Formato salvo:
  `PBKDF2-SHA256$100000$<salt base64>$<hash base64>`

Gerar o hash no navegador e mandar no lugar da senha **não** aumenta a segurança (o hash vira a senha).
O hash em `src/utils/hash.ts` existe só para o back-end simulado, no mesmo formato do .NET.

## Contrato da API (para implementar no .NET)

Os DTOs já estão em `TerapiasIntegrativas.Application/DTOs/AuthDtos.cs`. Em dev, o Vite repassa
`/api/*` para `https://localhost:7212` (ajuste `VITE_API_PROXY_TARGET`), então não precisa de CORS local.

### `POST /api/auth/login`

```json
{ "cpf": "52998224725", "senha": "Terapia@2026" }
```

- **200** → `AuthResponse`
- **401** → CPF ou senha inválidos. Use a **mesma mensagem** para CPF inexistente e senha errada
  (não revela quais CPFs têm cadastro). O front então mostra o link para se cadastrar.

### `POST /api/auth/cadastro`

```json
{ "nome": "Maria da Silva", "cpf": "52998224725", "email": "maria@exemplo.com", "senha": "Terapia@2026" }
```

- **201/200** → `AuthResponse` (o usuário já entra logado)
- **400** → validação. Pode devolver `ValidationProblemDetails`; os erros por campo
  (`{ "errors": { "Cpf": ["CPF inválido."] } }`) aparecem embaixo do campo correspondente.
- **409** → CPF já cadastrado (o front oferece "Fazer login com este CPF").

### `AuthResponse`

```json
{
  "token": "<JWT>",
  "usuario": { "id": "guid", "nome": "Maria da Silva", "cpf": "52998224725", "email": "maria@exemplo.com" }
}
```

Erros devem vir como `ProblemDetails` (`title` / `detail`) — o front exibe `detail` ou `title`.
O token é enviado nas próximas requisições como `Authorization: Bearer <token>`.

## Checklist do back-end

- [ ] Entidade `Usuario` (Id, Nome, Cpf — **único**, Email, SenhaHash, DataCadastro)
- [ ] Registrar `IPasswordHasher` → `Pbkdf2PasswordHasher` no `Infra.IoC`
- [ ] Validar CPF (`CpfValidator`) e senha (`PasswordPolicy`) no cadastro
- [ ] Salvar apenas `SenhaHash` (nunca a senha)
- [ ] Gerar JWT no login/cadastro
- [ ] Limitar tentativas de login (rate limiting do ASP.NET) contra força bruta
- [ ] HTTPS obrigatório; em produção, considerar JWT em cookie `HttpOnly` + `Secure`

## Estrutura

```
src/
  components/   AuthLayout, FormField, PasswordStrength, ProtectedRoute
  context/      AuthContext (sessão, login, cadastro, logout)
  pages/        LoginPage, CadastroPage, HomePage
  services/     apiClient (fetch + token), authService (real x mock), mockAuthApi, types (contrato)
  utils/        cpf (máscara/validação), password (regras/força), hash (PBKDF2 do mock)
  styles/       global.css
```
