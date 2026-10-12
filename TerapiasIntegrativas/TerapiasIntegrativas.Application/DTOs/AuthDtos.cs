namespace TerapiasIntegrativas.Application.DTOs
{
    // Contrato usado pelo front-end React (frontend/src/services/types.ts).
    // O System.Text.Json serializa em camelCase por padrão, então os nomes batem com o front.

    /// <summary>POST /api/auth/login</summary>
    public record LoginRequestDto(string Cpf, string Senha);

    /// <summary>POST /api/auth/cadastro</summary>
    public record CadastroRequestDto(string Nome, string Cpf, string Email, string Senha);

    public record UsuarioDto(Guid Id, string Nome, string Cpf, string Email);

    /// <summary>Resposta de sucesso do login e do cadastro.</summary>
    public record AuthResponseDto(string Token, UsuarioDto Usuario);
}
