using System.Text.RegularExpressions;

namespace TerapiasIntegrativas.Application.Validation
{
    /// <summary>
    /// Regras de senha forte — as mesmas de frontend/src/utils/password.ts.
    /// O front valida para dar feedback ao usuário; esta validação é a que realmente vale.
    /// </summary>
    public static class PasswordPolicy
    {
        public const int MinLength = 8;

        public static IReadOnlyList<string> Validate(string? senha)
        {
            var erros = new List<string>();
            senha ??= string.Empty;

            if (senha.Length < MinLength) erros.Add($"A senha deve ter pelo menos {MinLength} caracteres.");
            if (!Regex.IsMatch(senha, "[A-Z]")) erros.Add("A senha deve ter uma letra maiúscula.");
            if (!Regex.IsMatch(senha, "[a-z]")) erros.Add("A senha deve ter uma letra minúscula.");
            if (!Regex.IsMatch(senha, @"\d")) erros.Add("A senha deve ter um número.");
            if (!Regex.IsMatch(senha, @"[^A-Za-z0-9\s]")) erros.Add("A senha deve ter um caractere especial.");
            if (Regex.IsMatch(senha, @"\s")) erros.Add("A senha não pode conter espaços.");

            return erros;
        }

        public static bool IsStrong(string? senha) => Validate(senha).Count == 0;
    }
}
