namespace Meetrix.Infrastructure.Auth;

public static class BcryptPasswordHasher
{
    private const int WorkFactor = 12; // good default for dev/prod
    public static string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);
    public static bool Verify(string password, string hash) =>
        !string.IsNullOrWhiteSpace(hash) && BCrypt.Net.BCrypt.Verify(password, hash);
}
