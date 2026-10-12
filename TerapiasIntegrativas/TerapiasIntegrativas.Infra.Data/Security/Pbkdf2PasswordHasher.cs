using System.Security.Cryptography;
using TerapiasIntegrativas.Application.Interfaces;

namespace TerapiasIntegrativas.Infra.Data.Security
{
    /// <summary>
    /// Hash de senha com PBKDF2-SHA256 + salt aleatório, usando só o .NET (sem pacotes extras).
    /// Formato salvo no banco: PBKDF2-SHA256$iteracoes$saltBase64$hashBase64
    /// (o mesmo formato do back-end simulado do front, em frontend/src/utils/hash.ts).
    /// </summary>
    public class Pbkdf2PasswordHasher : IPasswordHasher
    {
        private const string Algoritmo = "PBKDF2-SHA256";
        private const int Iteracoes = 100_000;
        private const int SaltBytes = 16;
        private const int HashBytes = 32;

        public string Hash(string senha)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltBytes);
            var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, Iteracoes, HashAlgorithmName.SHA256, HashBytes);
            return $"{Algoritmo}${Iteracoes}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
        }

        public bool Verify(string senha, string hashSalvo)
        {
            var partes = hashSalvo.Split('$');
            if (partes.Length != 4 || partes[0] != Algoritmo || !int.TryParse(partes[1], out var iteracoes))
                return false;

            try
            {
                var salt = Convert.FromBase64String(partes[2]);
                var esperado = Convert.FromBase64String(partes[3]);
                var atual = Rfc2898DeriveBytes.Pbkdf2(senha, salt, iteracoes, HashAlgorithmName.SHA256, esperado.Length);
                return CryptographicOperations.FixedTimeEquals(atual, esperado);
            }
            catch (FormatException)
            {
                return false;
            }
        }
    }
}
