namespace TerapiasIntegrativas.Application.Interfaces
{
    public interface IPasswordHasher
    {
        /// <summary>Gera o hash (com salt aleatório) que deve ser salvo no banco no lugar da senha.</summary>
        string Hash(string senha);

        /// <summary>Confere se a senha digitada corresponde ao hash salvo.</summary>
        bool Verify(string senha, string hashSalvo);
    }
}
