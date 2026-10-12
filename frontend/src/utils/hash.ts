/**
 * Hash de senha com PBKDF2-SHA256 (Web Crypto API).
 *
 * IMPORTANTE: este hash é usado APENAS pelo back-end simulado (mockAuthApi).
 * Com a API real, o front envia a senha em texto via HTTPS e quem gera e guarda
 * o hash é o back-end (veja Pbkdf2PasswordHasher.cs). Gerar o hash no navegador e
 * enviá-lo no lugar da senha não aumenta a segurança: o hash passaria a ser a "senha".
 *
 * O formato gerado é o mesmo do back-end .NET, para facilitar a comparação:
 *   PBKDF2-SHA256$<iteracoes>$<salt base64>$<hash base64>
 */
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `PBKDF2-SHA256$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterations, salt, expected] = stored.split('$');
  if (algorithm !== 'PBKDF2-SHA256' || !iterations || !salt || !expected) return false;

  const actual = await derive(password, fromBase64(salt), Number(iterations));
  const expectedBytes = fromBase64(expected);
  if (actual.length !== expectedBytes.length) return false;

  // Comparação em tempo constante.
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expectedBytes[i];
  return diff === 0;
}
