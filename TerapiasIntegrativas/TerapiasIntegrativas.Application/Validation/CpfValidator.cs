namespace TerapiasIntegrativas.Application.Validation
{
    /// <summary>Validação de CPF pelos dígitos verificadores — mesma lógica de frontend/src/utils/cpf.ts.</summary>
    public static class CpfValidator
    {
        public static string OnlyDigits(string? valor) =>
            new string((valor ?? string.Empty).Where(char.IsDigit).ToArray());

        public static bool IsValid(string? valor)
        {
            var cpf = OnlyDigits(valor);
            if (cpf.Length != 11 || cpf.Distinct().Count() == 1) return false;

            return CalcularDigito(cpf, 9) == cpf[9] - '0'
                && CalcularDigito(cpf, 10) == cpf[10] - '0';
        }

        private static int CalcularDigito(string cpf, int tamanho)
        {
            var soma = 0;
            for (var i = 0; i < tamanho; i++)
                soma += (cpf[i] - '0') * (tamanho + 1 - i);

            var resto = soma * 10 % 11;
            return resto == 10 ? 0 : resto;
        }
    }
}
